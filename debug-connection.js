require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

const debugConnection = async () => {
  try {
    console.log('🔍 Debugging Database Connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check events
    const events = await Event.find({});
    console.log(`📊 Total events: ${events.length}`);
    
    if (events.length === 0) {
      console.log('❌ No events found - need to seed database');
    } else {
      console.log('✅ Events found:');
      events.forEach(event => {
        console.log(`- ${event.name} on ${event.date}`);
      });
    }

    await mongoose.disconnect();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
};

debugConnection();
