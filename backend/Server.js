/************************************************************
 * server.js
 ************************************************************/
require("./database");
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const Subscribers = require("./models/Subscribers"); // MongoDB model for subscribers
const Reminder = require("./models/Reminders");
const config = require("./config");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

require("dotenv").config();
app.use(bodyParser.json());

// Allow requests from localhost:3000 and your Netlify domain
const allowedOrigins = [
  "http://localhost:3000",
  "https://family-reminders.netlify.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

const remindersRouter = require("./routes/reminders");
app.use("/api", remindersRouter);

// Real SMTP transport configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465
  auth: {
    user: process.env.EMAIL_USER, // Loaded from .env
    pass: process.env.EMAIL_PASS, // Loaded from .env
  },
});

// Route to get all subscribers
app.get("/subscribe", async (req, res) => {
  try {
    const subscribers = await Subscribers.find({});
    res.status(200).json(subscribers);
  } catch (error) {
    console.error("Error retrieving subscribers:", error);
    res.status(500).json({ error: "Failed to retrieve subscribers." });
  }
});

// Route to handle subscription
app.post("/subscribe", async (req, res) => {
  console.log("POST /subscribe called");
  const { name, email } = req.body;

  // Basic validation
  if (!name || !email) {
    console.log("Missing name or email");
    return res.status(400).json({ error: "Name and email are required." });
  }

  try {
    // Save the subscriber to MongoDB
    const subscriber = new Subscribers({ name, email });
    await subscriber.save();

    console.log("Subscriber saved:", subscriber);

    // Send welcome email with existing format
    const mailOptions = {
      from: '"Reminders App" <reminder892@gmail.com>',
      to: email,
      subject: "Welcome to Reminders!",
      html: `
        <div style="font-family: 'Quicksand', sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #f1356d; text-align: center;">Welcome to Reminders, ${name}!</h2>
          <p>Thank you for subscribing to our service. We’re excited to help you stay organized and on top of your important dates!</p>
          <p style="margin-top: 20px;">Feel free to explore the app and create your first reminder today. Here’s to staying on schedule!</p>
          <p style="text-align: center; margin-top: 30px;">
            <a href="https://family-reminders.netlify.app/" style="color: white; background-color: #f1356d; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">Visit Reminders App</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 0.9em; color: #666; text-align: center;">This email was sent automatically. If you have any concerns, contact us at <a href="mailto:xavier.lallonde@gmail.com" style="color: #f1356d;">xavier.lallonde@gmail.com</a>.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent to:", email);

    res.status(201).json({ message: "Subscription successful!" });
  } catch (error) {
    console.error("Error subscribing:", error.message);
    res.status(500).json({ error: "Failed to subscribe." });
  }
});

// DELETE route to handle unsubscriptions
app.delete("/subscribe/:email", async (req, res) => {
  const email = req.params.email;
  console.log("Received DELETE request for email:", email);

  try {
    // Find and delete the subscriber in MongoDB
    const subscriber = await Subscribers.findOneAndDelete({ email });
    if (!subscriber) {
      console.log("Subscriber not found:", email);
      return res.status(404).json({ error: "Subscriber not found." });
    }

    console.log("Subscriber deleted:", subscriber);

    // Send farewell email with existing format
    const mailOptions = {
      from: '"Reminders App" <samy@reminders.com>',
      to: email,
      subject: "Goodbye from Reminders!",
      html: `
        <div style="font-family: 'Quicksand', sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #f1356d; text-align: center;">Goodbye, ${
            subscriber.name || "Subscriber"
          }!</h2>
          <p>We’re sorry to see you go. Your subscription to Reminders has been canceled.</p>
          <p style="margin-top: 20px;">If you change your mind, you’re always welcome to come back. We’ll be here to help you stay organized and on top of your important dates.</p>
          <p style="text-align: center; margin-top: 30px;">
            <a href="https://family-reminders.netlify.app/" style="color: white; background-color: #f1356d; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">Resubscribe to Reminders</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 0.9em; color: #666; text-align: center;">This email was sent automatically. If you have any concerns, contact us at <a href="mailto:xavier.lallonde@gmail.com" style="color: #f1356d;">xavier.lallonde@gmail.com</a>.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Farewell email sent to:", email);

    res.status(200).json({ message: "Subscription deleted successfully." });
  } catch (error) {
    console.error("Error unsubscribing:", error.message);
    res.status(500).json({ error: "Failed to unsubscribe." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const cron = require("node-cron");

// Function to handle daily email tasks
const dailyTask = async () => {
  console.log("Running daily email task...");

  const today = new Date().toISOString().split("T")[0];
  console.log("Today's date (UTC):", today);

  try {
    // Query reminders for today's date from MongoDB
    const reminders = await Reminder.find({ date: today });
    if (reminders.length === 0) {
      console.log("No reminders for today.");
      return;
    }

    // Query all subscribers from MongoDB
    const subscribers = await Subscribers.find({});
    console.log(
      `Processing ${reminders.length} reminders for ${subscribers.length} subscribers.`
    );

    reminders.forEach((reminder) => {
      subscribers.forEach((subscriber) => {
        const mailOptions = {
          from: '"Reminders App" <no-reply@reminders.com>',
          to: subscriber.email,
          subject: `Reminder: ${reminder.title}`,
          html: `
            <div style="font-family: 'Quicksand', sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #f1356d; text-align: center;">Hi ${
                subscriber.name || "there"
              },</h2>
              <p>We’re sending you a friendly reminder!</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <th style="background-color: #f1356d; color: white; padding: 8px;">Detail</th>
                  <th style="background-color: #f1356d; color: white; padding: 8px;">Information</th>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">Title</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${
                    reminder.title
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">Category</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${
                    reminder.category
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">Date</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${
                    reminder.date
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">Details</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${
                    reminder.body
                  }</td>
                </tr>
              </table>
            </div>
          `,
        };

        transporter.sendMail(mailOptions, (err) => {
          if (err) {
            console.error(
              `Error sending email for reminder: ${reminder.title}`
            );
          }
        });
      });
    });

    console.log("Daily task completed successfully.");
  } catch (error) {
    console.error("Error running daily task:", error);
  }
};

app.get("/test-daily-task", async (req, res) => {
  try {
    await dailyTask();
    res.status(200).send("Daily task executed successfully.");
  } catch (error) {
    console.error("Error executing daily task:", error);
    res.status(500).send("Error executing daily task.");
  }
});

// Schedule the task to run at midnight (Ottawa time) every day
cron.schedule("0 5 * * *", dailyTask); // Runs at 5:00 AM UTC, midnight in Ottawa
// Above line was commented out because i used to use an external scheduler

// cron.schedule("* * * * *", dailyTask); // For testing purposes, will check the DB every minute
