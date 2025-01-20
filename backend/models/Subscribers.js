const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  subscribedAt: { type: Date, default: Date.now },
});

const Subscribers = mongoose.model("Subscribers", subscriberSchema);

module.exports = Subscribers;
