# Event Booking System - Backend API

A Node.js Express backend API for the Event Booking System using MongoDB and JWT authentication.

## Features

- **Authentication**: JWT-based user registration and login
- **Event Management**: Browse upcoming events with seat availability
- **Booking System**: Book tickets, manage bookings, and cancel reservations
- **Real-time Updates**: Dynamic seat availability updates
- **Secure**: Password hashing, JWT tokens, and input validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing, express-validator for input validation
- **CORS**: Enabled for frontend integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/event_booking
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```

3. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Seed Sample Data
```bash
npm run seed
```

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /me` - Get current user (protected)

### Events
- `GET /api/events` - Get all upcoming events
- `GET /api/events/:id` - Get single event details
- `POST /api/events` - Create new event (protected)

### Bookings
- `POST /api/events/:id/book` - Book tickets for an event (protected)
- `GET /api/bookings` - Get user's bookings (protected)
- `POST /api/bookings/:id/cancel` - Cancel a booking (protected)

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login User
```http
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Event Endpoints

#### Get All Events
```http
GET /api/events
```

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "name": "Summer Synthwave Festival",
      "date": "2025-07-15T19:00:00.000Z",
      "location": "Central Park Amphitheater",
      "available_seats": 500
    }
  ]
}
```

### Booking Endpoints

#### Book Tickets
```http
POST /api/events/:id/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "tickets": 2
}
```

#### Get User Bookings
```http
GET /api/bookings
Authorization: Bearer <token>
```

#### Cancel Booking
```http
POST /api/bookings/:id/cancel
Authorization: Bearer <token>
```

## Database Schema

### User Model
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `createdAt`: Date
- `updatedAt`: Date

### Event Model
- `name`: String (required)
- `date`: Date (required)
- `location`: String (required)
- `total_seats`: Number (required)
- `available_seats`: Number (required)
- `description`: String
- `createdAt`: Date
- `updatedAt`: Date

### Booking Model
- `user`: ObjectId (ref: User)
- `event`: ObjectId (ref: Event)
- `userName`: String (required)
- `userEmail`: String (required)
- `tickets`: Number (required)
- `status`: String (enum: ['Confirmed', 'Cancelled'])
- `bookingDate`: Date
- `createdAt`: Date
- `updatedAt`: Date

## Error Handling

The API provides consistent error responses:

```json
{
  "message": "Error description",
  "errors": [...] // Validation errors if applicable
}
```

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Input validation and sanitization
- CORS configuration
- Rate limiting ready (can be added)

## Development Tips

1. **Use MongoDB Compass** to visualize your database
2. **Postman** or **Thunder Client** for API testing
3. **MongoDB Atlas** for cloud database (update MONGODB_URI in .env)
4. **nodemon** for automatic server restart during development

## Common Issues

### MongoDB Connection Issues
- Ensure MongoDB is running locally
- Check MONGODB_URI in .env file
- For MongoDB Atlas, use connection string format: `mongodb+srv://username:password@cluster.mongodb.net/event_booking`

### CORS Issues
- Ensure frontend is configured to send requests to the correct backend URL
- Check if CORS is properly configured in server.js

### JWT Token Issues
- Ensure JWT_SECRET is set in .env file
- Check token expiration (default: 7 days)
- Verify Authorization header format: `Bearer <token>`
