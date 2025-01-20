const express = require("express");
const Reminder = require("../models/Reminders"); // Import the model
const router = express.Router();

// Create a new reminder
router.post("/reminders", async (req, res) => {
  //   console.log("Request Body:", req.body); // Add this line
  try {
    const reminder = new Reminder(req.body);
    await reminder.save();
    res
      .status(201)
      .json({ message: "Reminder created successfully", reminder });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all reminders
router.get("/reminders", async (req, res) => {
  try {
    const reminders = await Reminder.find();
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific reminder by ID
router.get("/reminders/:id", async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.status(200).json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a reminder by ID
router.put("/reminders/:id", async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res
      .status(200)
      .json({ message: "Reminder updated successfully", reminder });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a reminder by ID
router.delete("/reminders/:id", async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.status(200).json({ message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
