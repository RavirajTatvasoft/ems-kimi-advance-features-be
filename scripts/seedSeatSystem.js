const mongoose = require('mongoose');
const Event = require('../models/Event');
const Seat = require('../models/Seat');
require('dotenv').config();

const seedSeatSystem = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking');
    console.log('Connected to MongoDB');

    // Create a sample event with seat layout
    const sampleEvent = new Event({
      name: "Concert Experience 2025",
      date: new Date('2025-12-15T19:00:00'),
      location: "Grand Theater Arena",
      description: "An amazing concert experience with interactive seat selection",
      total_seats: 80,
      available_seats: 80,
      price: 50,
      seat_layout: {
        rows: 8,
        seats_per_row: 10,
        sections: [
          { name: 'VIP', rows: ['A', 'B'], price_multiplier: 2.0 },
          { name: 'Premium', rows: ['C', 'D', 'E'], price_multiplier: 1.5 },
          { name: 'General', rows: ['F', 'G', 'H'], price_multiplier: 1.0 }
        ]
      },
      has_seat_selection: true
    });

    await sampleEvent.save();
    console.log('✅ Sample event created:', sampleEvent.name);

    // Create seats for the event
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const seats = [];
    
    for (let i = 0; i < 8; i++) {
      const row = alphabet[i];
      const section = sampleEvent.seat_layout.sections.find(s => s.rows.includes(row));
      
      for (let j = 1; j <= 10; j++) {
        const price = Math.round(sampleEvent.price * (section?.price_multiplier || 1));
        const type = section?.name === 'VIP' ? 'vip' : section?.name === 'Premium' ? 'premium' : 'regular';
        
        seats.push({
          event: sampleEvent._id,
          seatNumber: j.toString(),
          row,
          section: section?.name || 'General',
          price,
          status: 'available',
          type
        });
      }
    }

    await Seat.insertMany(seats);
    console.log(`✅ ${seats.length} seats created for ${sampleEvent.name}`);

    // Create another event without seat selection
    const regularEvent = new Event({
      name: "Jazz Night Special",
      date: new Date('2025-12-20T20:00:00'),
      location: "Jazz Club Downtown",
      description: "Classic jazz evening with traditional ticket booking",
      total_seats: 100,
      available_seats: 100,
      price: 30,
      has_seat_selection: false
    });

    await regularEvent.save();
    console.log('✅ Regular event created:', regularEvent.name);

    console.log('\n🎯 Ready to test!');
    console.log('1. Login as admin: admin@eventify.com / admin123');
    console.log('2. Go to Admin Dashboard');
    console.log('3. Click "Manage Seats" on Concert Experience 2025');
    console.log('4. Go to Events page to see seat selection in action!');

  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run seed
if (require.main === module) {
  seedSeatSystem();
}

module.exports = { seedSeatSystem };
