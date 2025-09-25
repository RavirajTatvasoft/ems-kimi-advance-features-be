const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

const router = express.Router();

// Book tickets for an event
router.post('/events/:id/book', [
  auth,
  body('name').trim().isLength({ min: 2 }).withMessage('Please provide your full name'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
  body('tickets').isInt({ min: 1, max: 10 }).withMessage('You can book between 1 and 10 tickets only')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      return res.status(400).json({ 
        message: errorMessages.join('. '), 
        error: errorMessages[0] 
      });
    }

    const { name, email, tickets } = req.body;
    const eventId = req.params.id;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event date has passed
    if (event.date < new Date()) {
      return res.status(400).json({ message: 'Cannot book tickets for past events' });
    }

    // Check seat availability
    if (event.available_seats < tickets) {
      return res.status(400).json({ 
        message: 'Not enough seats available', 
        available_seats: event.available_seats 
      });
    }

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
      tickets,
      status: 'Confirmed'
    });

    // Update event available seats
    event.available_seats -= tickets;

    await booking.save();
    await event.save();

    res.status(201).json({
      id: booking._id,
      message: 'Booking confirmed successfully'
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error while creating booking' });
  }
});

// Get all bookings for logged-in user
router.get('/bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'name date location')
      .sort({ createdAt: -1 });

    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      eventId: booking.event._id,
      event_name: booking.event.name,
      date: booking.event.date.toISOString(),
      location: booking.event.location,
      userName: booking.userName,
      userEmail: booking.userEmail,
      tickets: booking.tickets,
      status: booking.status
    }));

    res.json({ data: formattedBookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
});

// Cancel a booking
router.post('/bookings/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    }).populate('event');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Check if event date has passed
    if (booking.event.date < new Date()) {
      return res.status(400).json({ message: 'Cannot cancel booking for past events' });
    }

    // Update booking status
    booking.status = 'Cancelled';

    // Restore seats to the event
    const event = await Event.findById(booking.event._id);
    if (event) {
      event.available_seats += booking.tickets;
      await event.save();
    }

    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).json({ message: 'Server error while cancelling booking' });
  }
});

module.exports = router;
