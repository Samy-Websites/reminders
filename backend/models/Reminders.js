const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  category: { type: String },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Reminder = mongoose.model("Reminder", reminderSchema);

module.exports = Reminder;
