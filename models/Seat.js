const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  seatNumber: {
    type: String,
    required: true,
    trim: true
  },
  row: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    default: 'General',
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'reserved'],
    default: 'available'
  },
  type: {
    type: String,
    enum: ['regular', 'vip', 'premium'],
    default: 'regular'
  }
}, {
  timestamps: true
});

// Ensure unique seat numbers per event
seatSchema.index({ event: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
