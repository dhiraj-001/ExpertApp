const express = require('express');
const router = express.Router();

const {
  createBooking,
  getBookings,
  updateBookingStatus
} = require('../controllers/bookingController');

router.post('/', createBooking);

router.get('/', getBookings);

router.patch('/:id/status', updateBookingStatus);

router.patch('/:id/confirm', confirmBooking);

module.exports = router;