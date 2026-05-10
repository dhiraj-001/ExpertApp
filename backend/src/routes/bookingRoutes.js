const express = require('express');
const router = express.Router();

const {
  createBooking,
  getBookings,
  updateBookingStatus,
  confirmBooking
} = require('../controllers/bookingController');

router.post('/', createBooking);

router.get('/', getBookings);

router.patch('/:id/status', updateBookingStatus);

router.patch('/confirm/:id', confirmBooking);

module.exports = router;