const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  participantName: {
    type: String,
    required: true,
  },
  availableTimes: [{
    type: Date,
    required: true,
  }],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Response', ResponseSchema);