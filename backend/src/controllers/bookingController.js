const Booking = require("../models/Booking");

exports.createBooking = async (req, res) => {
  try {
    const {
      expertId,
      userEmail,
      userName,
      phone,
      date,
      timeSlot,
      notes,
    } = req.body;

    if (
      !expertId ||
      !userEmail ||
      !userName ||
      !date ||
      !timeSlot
    ) {
      return res.status(400).json({
        message: 'Please fill all required fields'
      });
    }

    const newBooking = new Booking({
      expertId,
      userEmail,
      userName,
      phone,
      date,
      timeSlot,
      notes,
    });

    await newBooking.save();

    // Socket.io real-time update
    const io = req.app.get('socketio');
    io.emit('slotBooked', {
      expertId,
      date,
      timeSlot
    });

    res.status(201).json(newBooking);

  } catch (error) {
    // Prevent double booking
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'This slot is already booked. Please choose another time.'
      });
    }

    res.status(500).json({
      message: 'Server Error',
      error: error.message
    });
  }
};
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Pending', 'Confirmed', 'Completed'

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!updatedBooking)
      return res.status(404).json({ message: "Booking not found" });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { email } = req.query;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Find bookings for the user
    const bookings = await Booking.find({ userEmail: email }).populate(
      "expertId",
    );

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bookings",
      error,
    });
  }
};
