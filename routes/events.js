const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find({ 
      date: { $gte: new Date() } 
    }).sort({ date: 1 });

    const formattedEvents = events.map(event => ({
      id: event._id,
      name: event.name,
      date: event.date.toISOString(),
      location: event.location,
      available_seats: event.available_seats,
      description: event.description
    }));

    res.json({ data: formattedEvents });
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

// Create new event (admin functionality - optional)
router.post('/events', auth, async (req, res) => {
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
        description: event.description
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error while creating event' });
  }
});

module.exports = router;
