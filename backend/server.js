const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for bookings
let bookings = [];

// Create a booking
app.post("/api/bookings", (req, res) => {
  const booking = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date(),
  };

  // Check for double booking
  const existingBooking = bookings.find(
    (b) => b.date === booking.date && b.time === booking.time
  );

  if (existingBooking) {
    return res.status(400).json({
      error: "This time slot is already booked",
    });
  }

  bookings.push(booking);
  res.status(201).json(booking);
});

// Get all bookings
app.get("/api/bookings", (req, res) => {
  res.json(bookings);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
