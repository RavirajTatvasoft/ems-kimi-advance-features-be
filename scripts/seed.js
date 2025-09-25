require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');

const sampleEvents = [
  {
    name: 'Autumn Synthwave Festival',
    date: '2025-10-15T19:00:00',
    location: 'Central Park Amphitheater',
    total_seats: 500,
    available_seats: 500,
    description: 'Experience the nostalgic sounds of synthwave with live performances from top artists'
  },
  {
    name: 'October Jazz Night',
    date: '2025-10-22T20:30:00',
    location: 'Riverside Jazz Club',
    total_seats: 150,
    available_seats: 150,
    description: 'An intimate evening of smooth jazz under the starlit sky'
  },
  {
    name: 'November Indie Showcase',
    date: '2025-11-01T21:00:00',
    location: 'The Underground Venue',
    total_seats: 300,
    available_seats: 300,
    description: 'Discover the best indie rock bands in an electrifying atmosphere'
  },
  {
    name: 'Winter Electronic Fest',
    date: '2025-11-08T22:00:00',
    location: 'Neon Warehouse',
    total_seats: 400,
    available_seats: 400,
    description: 'Dance the night away with top DJs spinning the latest electronic beats'
  },
  {
    name: 'December Folk Gathering',
    date: '2025-12-15T18:30:00',
    location: 'Garden Pavilion',
    total_seats: 200,
    available_seats: 200,
    description: 'Relax with soulful folk music in a beautiful garden setting'
  },
  {
    name: 'Rock Concert Extravaganza',
    date: '2025-10-25T20:00:00',
    location: 'Stadium Arena',
    total_seats: 1000,
    available_seats: 1000,
    description: 'Epic rock concert featuring legendary bands and pyrotechnics'
  },
  {
    name: 'Classical Symphony Night',
    date: '2025-11-12T19:30:00',
    location: 'Grand Opera House',
    total_seats: 350,
    available_seats: 350,
    description: 'Experience the timeless beauty of classical music with world-class orchestra'
  },
  {
    name: 'Comedy Stand-Up Special',
    date: '2025-11-20T20:00:00',
    location: 'Comedy Central Theater',
    total_seats: 250,
    available_seats: 250,
    description: 'Laugh out loud with top comedians in an intimate setting'
  },
  {
    name: 'Food & Wine Festival',
    date: '2025-12-05T17:00:00',
    location: 'Riverside Park',
    total_seats: 600,
    available_seats: 600,
    description: 'Culinary delights paired with premium wines and live music'
  },
  {
    name: 'New Year Eve Countdown',
    date: '2025-12-31T21:00:00',
    location: 'City Square',
    total_seats: 800,
    available_seats: 800,
    description: 'Celebrate the New Year with fireworks, music, and festivities'
  },
  {
    name: 'Reggae Beach Party',
    date: '2026-01-15T16:00:00',
    location: 'Beachside Venue',
    total_seats: 400,
    available_seats: 400,
    description: 'Feel the island vibes with reggae music and ocean breeze'
  },
  {
    name: 'Blues & Soul Night',
    date: '2026-01-30T19:00:00',
    location: 'Blue Note Club',
    total_seats: 180,
    available_seats: 180,
    description: 'Soulful blues performances in an intimate jazz club atmosphere'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Insert sample events
    const events = await Event.insertMany(sampleEvents.map(event => ({
      ...event,
      date: new Date(event.date)
    })));

    console.log(`Inserted ${events.length} events`);
    console.log('Database seeded successfully!');

    // Log the inserted events
    events.forEach(event => {
      console.log(`- ${event.name} on ${event.date.toDateString()} at ${event.location}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedDatabase();
