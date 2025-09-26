const express = require('express');
const { body, validationResult } = require('express-validator');
const Seat = require('../models/Seat');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const { sendBookingConfirmation } = require('../services/emailService');

const router = express.Router();

// Get available seats for an event
router.get('/events/:id/seats', async (req, res) => {
  try {
    const { section, row } = req.query;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    let query = { event: req.params.id };
    if (section) query.section = section;
    if (row) query.row = row;

    const seats = await Seat.find(query)
      .select('seatNumber row section status price type')
      .sort({ row: 1, seatNumber: 1 });

    const groupedSeats = seats.reduce((acc, seat) => {
      const key = `${seat.section}-${seat.row}`;
      if (!acc[key]) {
        acc[key] = {
          section: seat.section,
          row: seat.row,
          seats: []
        };
      }
      acc[key].seats.push({
        id: seat._id,
        seatNumber: seat.seatNumber,
        status: seat.status,
        price: seat.price,
        type: seat.type
      });
      return acc;
    }, {});

    res.json({ 
      data: Object.values(groupedSeats),
      event: {
        id: event._id,
        name: event.name,
        hasSeatSelection: event.has_seat_selection,
        seatLayout: event.seat_layout
      }
    });
  } catch (error) {
    console.error('Get seats error:', error);
    res.status(500).json({ message: 'Server error while fetching seats' });
  }
});

// Create seats for an event (admin only)
router.post('/events/:id/seats', [
  auth,
  body('seats').isArray().withMessage('Seats must be an array'),
  body('seats.*.seatNumber').isString().withMessage('Seat number is required'),
  body('seats.*.row').isString().withMessage('Row is required'),
  body('seats.*.price').isNumeric().withMessage('Price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const { seats } = req.body;
    const seatDocs = seats.map(seat => ({
      ...seat,
      event: req.params.id
    }));

    const createdSeats = await Seat.insertMany(seatDocs);
    
    // Update event to enable seat selection
    event.has_seat_selection = true;
    await event.save();

    res.status(201).json({
      message: `${createdSeats.length} seats created successfully`,
      data: createdSeats
    });
  } catch (error) {
    console.error('Create seats error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate seat numbers found' });
    }
    res.status(500).json({ message: 'Server error while creating seats' });
  }
});

// Book specific seats
router.post('/events/:id/seats/book', [
  auth,
  body('seats').isArray({ min: 1 }).withMessage('At least one seat must be selected'),
  body('seats.*').isMongoId().withMessage('Each seat must be a valid ID'),
  body('name').trim().isLength({ min: 2 }).withMessage('Please provide your full name'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { seats: seatIds, name, email } = req.body;
    const eventId = req.params.id;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event date has passed
    if (event.date < new Date()) {
      return res.status(400).json({ message: 'Cannot book seats for past events' });
    }

    // Find and validate seats
    const seats = await Seat.find({
      _id: { $in: seatIds },
      event: eventId,
      status: 'available'
    });

    if (seats.length !== seatIds.length) {
      return res.status(400).json({ 
        message: 'Some seats are not available or do not exist' 
      });
    }

    // Calculate total price
    const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);

    // Check if user already has a confirmed booking for this event
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      event: eventId,
      status: 'Confirmed'
    });

    if (existingBooking) {
      return res.status(400).json({ 
        message: 'You already have a confirmed booking for this event' 
      });
    }

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      event: eventId,
      userName: name,
      userEmail: email,
      tickets: seats.length,
      seats: seatIds,
      totalAmount,
      status: 'Confirmed'
    });

    // Update seat statuses
    await Seat.updateMany(
      { _id: { $in: seatIds } },
      { status: 'booked' }
    );

    // Update event available seats
    event.available_seats -= seats.length;

    await booking.save();
    await event.save();

    // Send confirmation email
    try {
      await sendBookingConfirmation(booking, event);
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
    }

    res.status(201).json({
      id: booking._id,
      message: 'Seats booked successfully',
      seats: seats.map(seat => ({
        id: seat._id,
        seatNumber: seat.seatNumber,
        row: seat.row,
        section: seat.section,
        price: seat.price
      })),
      totalAmount,
      emailSent: process.env.NODE_ENV === 'production'
    });
  } catch (error) {
    console.error('Book seats error:', error);
    res.status(500).json({ message: 'Server error while booking seats' });
  }
});

// Get booking details with seat information
router.get('/bookings/:id/seats', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('seats').populate('event', 'name date location');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      booking: {
        id: booking._id,
        event: booking.event,
        seats: booking.seats,
        totalAmount: booking.totalAmount,
        status: booking.status,
        bookingDate: booking.bookingDate
      }
    });
  } catch (error) {
    console.error('Get booking seats error:', error);
    res.status(500).json({ message: 'Server error while fetching booking details' });
  }
});

module.exports = router;
