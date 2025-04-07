const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Survey = require('../models/Survey');
const { authenticateToken, restrictTo } = require('../middleware/authMiddleware');
const AppError = require('../utils/appError');
const sanitize = require('../utils/sanitize');

/**
 * POST /surveys
 * Create a new survey
 */
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const sanitizedBody = sanitize.requestBody(req.body);
    const { title, description, eventId, question, options, multipleChoice, closesAt } = sanitizedBody;

    // Validate required fields
    if (!question || !options || options.length < 2) {
      return res.status(400).json({ 
        error: 'Invalid survey data. Question and at least 2 options are required.' 
      });
    }

    // Validate eventId if provided
    if (eventId && !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid Event ID.' });
    }

    // Create survey with formatted options
    const formattedOptions = Array.isArray(options) 
      ? options.map(opt => typeof opt === 'string' ? { text: opt } : opt)
      : [];

    const survey = new Survey({
      title: title || question.substring(0, 50) + '...',
      description,
      eventId: eventId || null,
      question,
      options: formattedOptions,
      multipleChoice: multipleChoice || false,
      createdBy: req.user.id,
      closesAt: closesAt || null
    });

    await survey.save();

    res.status(201).json({
      status: 'success',
      data: {
        survey
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating survey: ' + error.message });
  }
});

/**
 * GET /surveys
 * Get all surveys (with optional filtering)
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    // Build query
    const query = {};
    
    if (req.query.eventId) {
      query.eventId = req.query.eventId;
    }
    
    if (req.query.createdBy) {
      query.createdBy = req.query.createdBy;
    }
    
    // Only active (not closed) surveys
    if (req.query.active === 'true') {
      query.closesAt = { $gt: new Date() };
    }

    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Execute query
    const surveys = await Survey.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Survey.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: surveys.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: {
        surveys
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching surveys: ' + error.message });
  }
});

/**
 * GET /surveys/:id
 * Get a specific survey
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        survey
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching survey: ' + error.message });
  }
});

/**
 * PATCH /surveys/vote
 * Vote on a survey
 */
router.patch('/vote', authenticateToken, async (req, res, next) => {
  try {
    const { surveyId, optionIndex } = req.body;
    
    // Validate inputs
    if (!surveyId || optionIndex == null) {
      return res.status(400).json({ error: 'Survey ID and option index are required.' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(surveyId)) {
      return res.status(400).json({ error: 'Invalid Survey ID.' });
    }

    // Find survey
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found.' });
    }

    // Check if user already voted
    if (survey.voters.includes(req.user.id)) {
      return res.status(400).json({ error: 'You have already voted on this survey.' });
    }

    // Check if option exists
    if (!survey.options[optionIndex]) {
      return res.status(400).json({ error: 'Invalid option index.' });
    }

    // Check if survey is closed
    if (survey.closesAt && survey.closesAt < new Date()) {
      return res.status(400).json({ error: 'This survey is closed.' });
    }

    // Register vote
    survey.options[optionIndex].votes += 1;
    survey.voters.push(req.user.id);
    await survey.save();

    // Return updated survey with results
    res.status(200).json({
      status: 'success',
      message: 'Vote registered successfully',
      data: {
        survey,
        results: survey.getResults()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error voting on survey: ' + error.message });
  }
});

/**
 * PATCH /surveys/:id/close
 * Close a survey (creator or admin only)
 */
router.patch('/:id/close', authenticateToken, async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Check if user is creator or admin
    if (
      survey.createdBy.toString() !== req.user.id &&
      req.user.userRole !== 'admin'
    ) {
      return res.status(403).json({ error: 'You are not authorized to close this survey' });
    }

    // Close survey
    survey.closesAt = new Date();
    await survey.save();

    res.status(200).json({
      status: 'success',
      message: 'Survey closed successfully',
      data: {
        survey
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error closing survey: ' + error.message });
  }
});

/**
 * DELETE /surveys/:id
 * Delete a survey (creator or admin only)
 */
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Check if user is creator or admin
    if (
      survey.createdBy.toString() !== req.user.id &&
      req.user.userRole !== 'admin'
    ) {
      return res.status(403).json({ error: 'You are not authorized to delete this survey' });
    }

    // Soft delete
    survey.active = false;
    await survey.save();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting survey: ' + error.message });
  }
});

module.exports = router;