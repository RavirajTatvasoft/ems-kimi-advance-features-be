const mongoose = require('mongoose');
const Event = require('../models/Event');
const Seat = require('../models/Seat');
require('dotenv').config();

const createSeatsForEvent = async (eventId) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking');
    console.log('Connected to MongoDB');

    const event = await Event.findById(eventId);
    if (!event) {
      console.log('Event not found');
      return;
    }

    // Create a simple theater-style seating arrangement
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 10;
    const seats = [];

    // Create seats for each row
    rows.forEach((row, rowIndex) => {
      for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
        const seatNumber = seatNum.toString();
        let price = event.price;
        let section = 'General';
        let type = 'regular';

        // VIP pricing for front rows
        if (rowIndex < 2) {
          price *= 1.5;
          section = 'VIP';
          type = 'vip';
        }
        // Premium pricing for middle rows
        else if (rowIndex >= 2 && rowIndex < 5) {
          price *= 1.2;
          section = 'Premium';
          type = 'premium';
        }

        seats.push({
          event: eventId,
          seatNumber,
          row,
          section,
          price: Math.round(price),
          status: 'available',
          type
        });
      }
    });

    // Insert seats
    await Seat.insertMany(seats);

    // Update event with seat layout
    event.has_seat_selection = true;
    event.seat_layout = {
      rows: rows.length,
      seats_per_row: seatsPerRow,
      sections: [
        { name: 'VIP', rows: ['A', 'B'], price_multiplier: 1.5 },
        { name: 'Premium', rows: ['C', 'D', 'E'], price_multiplier: 1.2 },
        { name: 'General', rows: ['F', 'G', 'H'], price_multiplier: 1 }
      ]
    };
    await event.save();

    console.log(`${seats.length} seats created for event: ${event.name}`);
    console.log('Seat layout updated');

  } catch (error) {
    console.error('Error creating seats:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Usage: node scripts/createSeats.js EVENT_ID
if (process.argv[2]) {
  createSeatsForEvent(process.argv[2]);
} else {
  console.log('Usage: node scripts/createSeats.js EVENT_ID');
}
