require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

const debugEvents = async () => {
  try {
    console.log('🔍 Debugging Events...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check all events (including past ones)
    const allEvents = await Event.find({});
    console.log(`📊 Total events in database: ${allEvents.length}`);
    
    // Check upcoming events
    const upcomingEvents = await Event.find({ 
      date: { $gte: new Date() } 
    }).sort({ date: 1 });
    console.log(`📅 Upcoming events: ${upcomingEvents.length}`);
    
    // Show all events for debugging
    allEvents.forEach(event => {
      console.log(`- ${event.name} on ${event.date} (${event.available_seats} seats available)`);
    });

    // Check if dates are in the future
    const now = new Date();
    console.log(`\n🕐 Current time: ${now}`);
    
    upcomingEvents.forEach(event => {
      console.log(`✅ Upcoming: ${event.name} - ${event.date}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

debugEvents();
