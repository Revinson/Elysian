const express = require('express');
const router = express.Router();
const Thread = require('../models/Thread');
const { authenticateToken, restrictTo, isAuthenticated } = require('../middleware/authMiddleware');
const AppError = require('../utils/appError');
const sanitize = require('../utils/sanitize');

/**
 * GET /threads
 * Get all threads with optional filtering
 */
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    // Build query
    const query = {};
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by tag
    if (req.query.tag) {
      query.tags = req.query.tag;
    }
    
    // Filter by author
    if (req.query.author) {
      query.author = req.query.author;
    }

    // Create sort object
    let sort = { lastActivity: -1 }; // Default sort by last activity
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'oldest':
          sort = { createdAt: 1 };
          break;
        case 'most-viewed':
          sort = { views: -1 };
          break;
        case 'most-liked':
          sort = { likeCount: -1 };
          break;
      }
    }

    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Execute query
    const threads = await Thread.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Thread.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: threads.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: {
        threads
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching threads: ' + error.message });
  }
});

/**
 * GET /threads/:id
 * Get a specific thread with replies
 */
router.get('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate({
        path: 'replies.author',
        select: 'username finalArchetype'
      });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Increment view count if user is not author
    if (req.user && thread.author._id.toString() !== req.user.id) {
      await thread.incrementViews();
    }

    res.status(200).json({
      status: 'success',
      data: {
        thread
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching thread: ' + error.message });
  }
});

/**
 * POST /threads
 * Create a new thread
 */
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const sanitizedBody = sanitize.requestBody(req.body);
    const { title, content, category, tags } = sanitizedBody;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    const thread = await Thread.create({
      title,
      content,
      category,
      tags: tags || [],
      author: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: {
        thread
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating thread: ' + error.message });
  }
});

/**
 * PATCH /threads/:id
 * Update a thread (author or admin only)
 */
router.patch('/:id', authenticateToken, async (req, res, next) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Check if user is author or admin
    if (
      thread.author._id.toString() !== req.user.id &&
      req.user.userRole !== 'admin'
    ) {
      return res.status(403).json({ error: 'You are not authorized to edit this thread' });
    }

    // Sanitize input
    const sanitizedBody = sanitize.requestBody(req.body);
    const { title, content, tags } = sanitizedBody;

    // Update fields
    if (title) thread.title = title;
    if (content) thread.content = content;
    if (tags) thread.tags = tags;

    await thread.save();

    res.status(200).json({
      status: 'success',
      data: {
        thread
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating thread: ' + error.message });
  }
});

/**
 * DELETE /threads/:id
 * Delete a thread (author or admin only)
 */
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Check if user is author or admin
    if (
      thread.author._id.toString() !== req.user.id &&
      req.user.userRole !== 'admin'
    ) {
      return res.status(403).json({ error: 'You are not authorized to delete this thread' });
    }

    // Soft delete
    thread.active = false;
    await thread.save();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting thread: ' + error.message });
  }
});

/**
 * POST /threads/:id/replies
 * Add a reply to a thread
 */
router.post('/:id/replies', authenticateToken, async (req, res, next) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    if (thread.isLocked) {
      return res.status(403).json({ error: 'This thread is locked' });
    }

    const { content } = sanitize.requestBody(req.body);

    if (!content) {
      return res.status(400).json({ error: 'Reply content is required' });
    }

    // Add reply
    thread.replies.push({
      content,
      author: req.user.id
    });

    // Update lastActivity
    thread.lastActivity = Date.now();
    
    await thread.save();

    // Get the newly added reply
    const newReply = thread.replies[thread.replies.length - 1];

    // Populate author
    await Thread.populate(thread, {
      path: 'replies.author',
      select: 'username finalArchetype'
    });

    res.status(201).json({
      status: 'success',
      data: {
        reply: thread.replies.id(newReply._id)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error adding reply: ' + error.message });
  }
});

/**
 * PATCH /threads/:id/replies/:replyId
 * Update a reply (author or admin only)
 */
router.patch('/:id/replies/:replyId', authenticateToken, async (req, res, next) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const reply = thread.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    // Check if user is author or admin
    if (
      reply.author.toString() !== req.user.id &&
      req.user.userRole !== 'admin'
    ) {
      return res.status(403).json({ error: 'You are not authorized to edit this reply' });
    }

    const { content } = sanitize.requestBody(req.body);

    if (!content) {
      return res.status(400).json({ error: 'Reply content is required' });
    }

    // Update reply
    reply.content = content;
    reply.edited = true;

    await thread.save();

    // Populate author
    await Thread.populate(thread, {
      path: 'replies.author',
      select: 'username finalArchetype'
    });

    res.status(200).json({
      status: 'success',
      data: {
        reply: thread.replies.id(req.params.replyId)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating reply: ' + error.message });
  }
});

/**
 * DELETE /threads/:id/replies/:replyId
 * Delete a reply (author or admin only)
 */
router.delete('/:id/replies/:replyId', authenticateToken, async (req, res, next) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const reply = thread.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    // Check if user is author or admin
    if (
      reply.author.toString() !== req.user.id &&
      req.user.userRole !== 'admin'
    ) {
      return res.status(403).json({ error: 'You are not authorized to delete this reply' });
    }

    // Soft delete
    reply.deleted = true;
    reply.content = '[This reply has been deleted]';

    await thread.save();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting reply: ' + error.message });
  }
});

/**
 * PATCH /threads/:id/like
 * Toggle like on a thread
 */
router.patch('/:id/like', authenticateToken, async (req, res, next) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Toggle like
    const isLiked = thread.toggleLike(req.user.id);
    await thread.save();

    res.status(200).json({
      status: 'success',
      data: {
        isLiked,
        likeCount: thread.likes.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error toggling like: ' + error.message });
  }
});

/**
 * PATCH /threads/:id/replies/:replyId/like
 * Toggle like on a reply
 */
router.patch('/:id/replies/:replyId/like', authenticateToken, async (req, res, next) => {
  try {
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const reply = thread.replies.id(req.params.replyId);

    if (!reply || reply.deleted) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    // Toggle like
    const isLiked = thread.toggleReplyLike(req.params.replyId, req.user.id);
    await thread.save();

    res.status(200).json({
      status: 'success',
      data: {
        isLiked,
        likeCount: reply.likes.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error toggling like on reply: ' + error.message });
  }
});

/**
 * PATCH /threads/:id/pin
 * Pin/unpin a thread (admin only)
 */
router.patch('/:id/pin', authenticateToken, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can pin/unpin threads' });
    }
    
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Toggle pinned status
    thread.isPinned = !thread.isPinned;
    await thread.save();

    res.status(200).json({
      status: 'success',
      data: {
        isPinned: thread.isPinned
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error pinning/unpinning thread: ' + error.message });
  }
});

/**
 * PATCH /threads/:id/lock
 * Lock/unlock a thread (admin only)
 */
router.patch('/:id/lock', authenticateToken, async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can lock/unlock threads' });
    }
    
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Toggle locked status
    thread.isLocked = !thread.isLocked;
    await thread.save();

    res.status(200).json({
      status: 'success',
      data: {
        isLocked: thread.isLocked
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error locking/unlocking thread: ' + error.message });
  }
});

module.exports = router;