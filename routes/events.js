const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get all events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find({ 
      date: { $gte: new Date() } 
    }).sort({ date: 1 });

    // Get booking counts for each event
    const Booking = require('../models/Booking');
    const eventsWithBookings = await Promise.all(
      events.map(async (event) => {
        const bookingCount = await Booking.countDocuments({
          event: event._id,
          status: 'Confirmed'
        });

        return {
          id: event._id,
          name: event.name,
          date: event.date.toISOString(),
          location: event.location,
          available_seats: event.available_seats,
          total_seats: event.total_seats,
          description: event.description,
          booking_count: bookingCount
        };
      })
    );

    res.json({ data: eventsWithBookings });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
});

// Get single event by ID
router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const formattedEvent = {
      id: event._id,
      name: event.name,
      date: event.date.toISOString(),
      location: event.location,
      available_seats: event.available_seats,
      total_seats: event.total_seats,
      description: event.description
    };

    res.json({ data: formattedEvent });
  } catch (error) {
    console.error('Get event error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error while fetching event' });
  }
});

// Create new event (admin only)
router.post('/events', adminAuth, async (req, res) => {
  try {
    const { name, date, location, total_seats, description } = req.body;

    const event = new Event({
      name,
      date: new Date(date),
      location,
      total_seats,
      available_seats: total_seats,
      description
    });

    await event.save();

    res.status(201).json({
      data: {
        id: event._id,
        name: event.name,
        date: event.date.toISOString(),
        location: event.location,
        available_seats: event.available_seats,
        total_seats: event.total_seats,
        description: event.description
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error while creating event' });
  }
});

// Update event (admin only)
router.put('/events/:id', adminAuth, async (req, res) => {
  try {
    const { name, date, location, total_seats, description } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update fields
    if (name) event.name = name;
    if (date) event.date = new Date(date);
    if (location) event.location = location;
    if (total_seats !== undefined) {
      const bookedSeats = event.total_seats - event.available_seats;
      event.total_seats = total_seats;
      event.available_seats = Math.max(0, total_seats - bookedSeats);
    }
    if (description !== undefined) event.description = description;

    await event.save();

    res.json({
      data: {
        id: event._id,
        name: event.name,
        date: event.date.toISOString(),
        location: event.location,
        available_seats: event.available_seats,
        total_seats: event.total_seats,
        description: event.description
      }
    });
  } catch (error) {
    console.error('Update event error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error while updating event' });
  }
});

// Delete event (admin only)
router.delete('/events/:id', adminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if there are any active bookings for this event
    const Booking = require('../models/Booking');
    const activeBookings = await Booking.countDocuments({
      event: req.params.id,
      status: 'Confirmed'
    });

    if (activeBookings > 0) {
      return res.status(409).json({ 
        message: `Cannot delete event. There are ${activeBookings} active booking(s) for this event.` 
      });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error while deleting event' });
  }
});

module.exports = router;
