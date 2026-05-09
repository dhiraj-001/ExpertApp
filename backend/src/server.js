require('dotenv').config();

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const cron = require('node-cron');
const axios = require('axios');

const app = express();
const server = http.createServer(app);


// Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"]
  }
});


// Middleware
app.use(cors());
app.use(express.json());


// Make socket accessible inside controllers
app.set('socketio', io);


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error.message);
  });


// Routes
app.use('/api/experts', require('./routes/expertRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));


// Health Check Route
app.get('/', (req, res) => {
  res.send('API is running...');
});


// Socket Connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


// Cron Job (Every 10 Minutes)
const BACKEND_URL = process.env.BACKEND_URL;

cron.schedule('*/10 * * * *', async () => {
  try {
    const response = await axios.get(BACKEND_URL);

    console.log(
      `Self-ping success: ${response.status} at ${new Date().toLocaleString()}`
    );
  } catch (error) {
    console.log('Self-ping failed:', error.message);
  }
});


// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: 'Something went wrong',
    error: err.message
  });
});


// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});