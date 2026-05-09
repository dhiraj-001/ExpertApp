const Expert = require('../models/Expert');
const Booking = require('../models/Booking');

// GET /experts
exports.getExperts = async (req, res) => {
  try {
    const { page = 1, limit = 6, search = '', category = '' } = req.query;

    // Build Query Object
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    const experts = await Expert.find(query)
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const count = await Expert.countDocuments(query);

    res.status(200).json({
      experts,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalExperts: count
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching experts",
      error: error.message
    });
  }
};


// GET /experts/:id
exports.getExpertDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    // Find expert
    const expert = await Expert.findById(id);

    if (!expert) {
      return res.status(404).json({
        message: "Expert not found"
      });
    }

    // Find booked slots for selected date
    let bookedSlots = [];

    if (date) {
      const bookings = await Booking.find({
        expertId: id,
        date
      }).select('timeSlot');

      bookedSlots = bookings.map(
        booking => booking.timeSlot
      );
    }

    res.status(200).json({
      expert,
      bookedSlots
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching expert details",
      error: error.message
    });
  }
};