const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expert",
      required: true,
    },

    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    userName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      required: true,
    },

    timeSlot: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed"],
      default: "Confirmed",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);


// Prevent double booking
bookingSchema.index(
  { expertId: 1, date: 1, timeSlot: 1 },
  { unique: true }
);

module.exports = mongoose.model("Booking", bookingSchema);