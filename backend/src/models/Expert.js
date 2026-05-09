const mongoose = require("mongoose");

const expertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  experience: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  profileImage: { type: String },
  availableSlots: [String],
});

module.exports = mongoose.model("Expert", expertSchema);
