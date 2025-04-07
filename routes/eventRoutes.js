const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { authenticateToken, restrictTo, isAuthenticated } = require('../middleware/authMiddleware');
const AppError = require('../utils/appError');
const sanitize = require('../utils/sanitize');

/**
 * GET /events
 * Get all events with optional filtering
 */
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    // Build query
    const query = {};
    
    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by tag
    if (req.query.tag) {
      query.tags = req.query.tag;
    }
    
    // Filter by organizer
    if (req.query.organizer) {
      query.organizer = req.query.organizer;
    }

    // Filter by date range
    if (req.query.startDate) {
      query.date = { $gte: new Date(req.query.startDate) };
    }
    
    if (req.query.endDate) {
      if (!query.date) query.date = {};
      query.date.$lte = new Date(req.query.endDate);
    }
    
    // Only upcoming events
    if (req.query.upcoming === 'true') {
      if (!query.date) query.date = {};
      query.date.$gte = new Date();
    }

    // Create sort object
    let sort = { date: 1 }; // Default sort by date ascending
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'date-desc':
          sort = { date: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'popular':
          sort = { attendeeCount: -1 };
          break;
      }
    }

    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Execute query
    const events = await Event.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Event.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: events.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: {
        events
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /events/:id
 * Get a specific event
 */
router.get('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /events
 * Create a new event (authenticated users only)
 */
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const sanitizedBody = sanitize.requestBody(req.body);
    const { 
      title, 
      description, 
      date, 
      location,
      type,
      capacity,
      imageUrl,
      tags
    } = sanitizedBody;

    if (!title || !date) {
      return next(new AppError('Title and date are required', 400));
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      type: type || 'online',
      capacity: capacity || null,
      organizer: req.user.id,
      imageUrl,
      tags: tags || []
    });

    res.status(201).json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /events/:id
 * Update an event (organizer or admin only)
 */
router.patch('/:id', authenticateToken, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    // Check if user is organizer or admin
    if (
      event.organizer._id.toString() !== req.user.id &&
      req.user.userRole !== 'admin'
    ) {
      return next(new AppError('You are not authorized to update this event', 403));
    }

    // Sanitize input
    const sanitizedBody = sanitize.requestBody(req.body);
    const { 
      title, 
      description, 
      date, 
      location,
      type,
      capacity,
      imageUrl,
      tags
    } = sanitizedBody;

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (location) event.location = location;
    if (type) event.type = type;
    if (capacity !== undefined) event.capacity = capacity;
    if (imageUrl) event.imageUrl = imageUrl;
    if (tags) event.tags = tags;

    await event.save();

    res.status(200).json({
      status: 'success',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /events/:id
 * Delete an event (organizer or admin only)
 */
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    // Check if user is organizer or admin
    if (
      event.organizer._id.toString() !== req.user.id &&
      req.user.userRole !== 'admin'
    ) {
      return next(new AppError('You are not authorized to delete this event', 403));
    }

    // Soft delete
    event.active = false;
    await event.save();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /events/:id/register
 * Register for an event
 */
router.post('/:id/register', authenticateToken, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    // Check if event is in the past
    if (event.date < new Date()) {
      return next(new AppError('Cannot register for past events', 400));
    }

    // Register attendee
    const success = event.addAttendee(req.user.id);

    if (!success) {
      return next(new AppError('Already registered or event is full', 400));
    }

    await event.save();

    res.status(200).json({
      status: 'success',
      message: 'Successfully registered for event',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /events/:id/register
 * Cancel registration for an event
 */
router.delete('/:id/register', authenticateToken, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    // Cancel registration
    const success = event.removeAttendee(req.user.id);

    if (!success) {
      return next(new AppError('Not registered for this event', 400));
    }

    await event.save();

    res.status(200).json({
      status: 'success',
      message: 'Successfully canceled registration',
      data: {
        event
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /events/:id/feature
 * Feature/unfeature an event (admin only)
 */
router.patch('/:id/feature', authenticateToken, restrictTo('admin'), async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    // Toggle featured status
    event.featured = !event.featured;
    await event.save();

    res.status(200).json({
      status: 'success',
      data: {
        featured: event.featured
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /events/:id/attendees
 * Get list of attendees (organizer or admin only)
 */
router.get('/:id/attendees', authenticateToken, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({
        path: 'attendees.user',
        select: 'username email finalArchetype'
      });

    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    // Check if user is organizer or admin
    if (
      event.organizer._id.toString() !== req.user.id &&
      req.user.userRole !== 'admin'
    ) {
      return next(new AppError('You are not authorized to view attendees', 403));
    }

    res.status(200).json({
      status: 'success',
      results: event.attendees.length,
      data: {
        attendees: event.attendees
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /events/:id/attendees/:userId
 * Update attendee status (organizer or admin only)
 */
router.patch('/:id/attendees/:userId', authenticateToken, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(new AppError('Event not found', 404));
    }

    // Check if user is organizer or admin
    if (
      event.organizer._id.toString() !== req.user.id &&
      req.user.userRole !== 'admin'
    ) {
      return next(new AppError('You are not authorized to update attendees', 403));
    }

    // Find attendee
    const attendee = event.attendees.find(
      a => a.user.toString() === req.params.userId
    );

    if (!attendee) {
      return next(new AppError('Attendee not found', 404));
    }

    // Update status
    const { status } = req.body;
    if (!['registered', 'attended', 'canceled'].includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    attendee.status = status;
    await event.save();

    res.status(200).json({
      status: 'success',
      data: {
        attendee
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;