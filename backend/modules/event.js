const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
  },
  participantsCount: {
    type: Number,
    required: true,
    min: 1,
  },
  bestTime: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Event', EventSchema);