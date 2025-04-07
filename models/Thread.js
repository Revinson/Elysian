const mongoose = require('mongoose');

// Reply schema (embedded document)
const replySchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Reply content is required'],
      trim: true,
      maxlength: [2000, 'Reply cannot exceed 2000 characters']
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Reply must have an author']
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    edited: {
      type: Boolean,
      default: false
    },
    deleted: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Thread schema
const threadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Thread title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
      type: String,
      required: [true, 'Thread content is required'],
      trim: true,
      maxlength: [4000, 'Content cannot exceed 4000 characters']
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Thread must have an author']
    },
    category: {
      type: String,
      required: [true, 'Thread category is required'],
      enum: ['general', 'events', 'support', 'offtopic', 'announcements']
    },
    tags: [String],
    replies: [replySchema],
    views: {
      type: Number,
      default: 0
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    isPinned: {
      type: Boolean,
      default: false
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property for reply count
threadSchema.virtual('replyCount').get(function () {
  return this.replies ? this.replies.filter(reply => !reply.deleted).length : 0;
});

// Virtual property for like count
threadSchema.virtual('likeCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// DOCUMENT MIDDLEWARE
threadSchema.pre('save', function (next) {
  // Update lastActivity on new replies
  if (this.isModified('replies')) {
    this.lastActivity = Date.now();
  }

  // Format tags
  if (this.tags) {
    this.tags = this.tags.map(tag => tag.toLowerCase().trim());
  }
  
  next();
});

// QUERY MIDDLEWARE
// Only return active threads
threadSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Populate author and reply authors
threadSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'author',
    select: 'username finalArchetype'
  });
  next();
});

// INSTANCE METHODS
// Add reply
threadSchema.methods.addReply = function (userId, content) {
  if (this.isLocked) return false;

  this.replies.push({
    content,
    author: userId
  });

  this.lastActivity = Date.now();
  return true;
};

// Toggle like
threadSchema.methods.toggleLike = function (userId) {
  const userIdStr = userId.toString();
  
  // Check if user already liked
  const likeIndex = this.likes.findIndex(
    id => id.toString() === userIdStr
  );

  if (likeIndex === -1) {
    // Add like
    this.likes.push(userId);
    return true;
  } else {
    // Remove like
    this.likes.splice(likeIndex, 1);
    return false;
  }
};

// Toggle reply like
threadSchema.methods.toggleReplyLike = function (replyId, userId) {
  const userIdStr = userId.toString();
  const reply = this.replies.id(replyId);
  
  if (!reply || reply.deleted) return false;

  // Check if user already liked
  const likeIndex = reply.likes.findIndex(
    id => id.toString() === userIdStr
  );

  if (likeIndex === -1) {
    // Add like
    reply.likes.push(userId);
    return true;
  } else {
    // Remove like
    reply.likes.splice(likeIndex, 1);
    return false;
  }
};

// Increment view count
threadSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

const Thread = mongoose.model('Thread', threadSchema);

module.exports = Thread;