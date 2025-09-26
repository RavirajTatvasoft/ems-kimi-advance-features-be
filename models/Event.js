const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [100, 'Event name cannot exceed 100 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  available_seats: {
    type: Number,
    required: [true, 'Available seats is required'],
    min: [0, 'Available seats cannot be negative']
  },
  total_seats: {
    type: Number,
    required: [true, 'Total seats is required'],
    min: [1, 'Total seats must be at least 1']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  seat_layout: {
    rows: {
      type: Number,
      required: true,
      min: 1
    },
    seats_per_row: {
      type: Number,
      required: true,
      min: 1
    },
    sections: [{
      name: {
        type: String,
        required: true
      },
      rows: {
        type: [String],
        required: true
      },
      price_multiplier: {
        type: Number,
        default: 1
      }
    }]
  },
  has_seat_selection: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure date is in the future
eventSchema.pre('save', function(next) {
  if (this.date < new Date()) {
    return next(new Error('Event date must be in the future'));
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
