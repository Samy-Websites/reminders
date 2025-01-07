/************************************************************
 * server.js
 ************************************************************/
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const jsonServer = require("json-server");
const config = require("./config");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

require("dotenv").config();

// Logs the database path (debugging)
console.log("Database Path:", config.dbPath);

// Paths to data files
const subscribersPath = path.join(__dirname, "data", "subscribers.json");
const remindersPath = path.join(__dirname, "data", "db.json");

// Ensure JSON files exist
if (!fs.existsSync(subscribersPath)) {
  console.log("subscribers.json not found. Creating a new file...");
  fs.writeFileSync(subscribersPath, JSON.stringify([]));
}

if (!fs.existsSync(remindersPath)) {
  console.log("db.json not found. Creating a new file...");
  fs.writeFileSync(remindersPath, JSON.stringify({ reminders: [] }));
}

// Middleware
app.use(
  cors({
    origin: "https://family-reminders.netlify.app", // Replace with your Netlify domain
  })
);
app.use(bodyParser.json());

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

// Route to handle subscription
app.post("/subscribe", async (req, res) => {
  console.log("POST /subscribe called");
  const { name, email } = req.body;

  // Basic validation
  if (!name || !email) {
    console.log("Missing name or email");
    return res.status(400).json({ error: "Name and email are required." });
  }

  // Email content WITH USERNAME
  const mailOptions = {
    from: '"Reminders App" <reminder892@gmail.com>',
    to: email,
    subject: "Welcome to Reminders!",
    text: `Hi ${name}, thank you for subscribing to Reminders!`,
    html: `
      <div style="font-family: 'Quicksand', sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #f1356d; text-align: center;">Welcome to Reminders, ${name}!</h2>
        <p>Thank you for subscribing to our service. We’re excited to help you stay organized and on top of your important dates!</p>
        <p style="margin-top: 20px;">Feel free to explore the app and create your first reminder today. Here’s to staying on schedule!</p>
        <p style="text-align: center; margin-top: 30px;">
          <a href="https://family-reminders.netlify.app/" style="color: white; background-color: #f1356d; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">Visit Reminders App</a>
        </p>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 0.9em; color: #666; text-align: center;">This email was sent automatically. If you have any concerns, contact us at <a href="mailto:support@remindersapp.com" style="color: #f1356d;">support@remindersapp.com</a>.</p>
      </div>
    `,
  };

  try {
    console.log("Sending email to:", email);
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent:", info.messageId);

    fs.readFile(subscribersPath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading subscribers file:", err);
        return res
          .status(500)
          .json({ error: "Server error while reading subscribers file." });
      }

      let subscribers = [];
      try {
        subscribers = JSON.parse(data);
      } catch (parseErr) {
        console.error("Error parsing subscribers file:", parseErr);
        return res
          .status(500)
          .json({ error: "Server error while parsing subscribers file." });
      }

      console.log("Adding subscriber:", { name, email });
      subscribers.push({ name, email });

      fs.writeFile(
        subscribersPath,
        JSON.stringify(subscribers, null, 2),
        (writeErr) => {
          if (writeErr) {
            console.error("Error writing subscribers file:", writeErr);
            return res
              .status(500)
              .json({ error: "Server error while saving subscriber." });
          }

          console.log("Subscription saved successfully");
          res.status(201).json({
            message: "Subscription successful!",
          });
        }
      );
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ message: "Error sending email." });
  }
});

// DELETE route to handle unsubscriptions
app.delete("/subscribe/:email", (req, res) => {
  const email = req.params.email;
  console.log("Received DELETE request for email:", email);

  fs.readFile(subscribersPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading subscribers file:", err);
      return res
        .status(500)
        .json({ error: "Server error while reading file." });
    }

    let subscribers = [];
    try {
      subscribers = JSON.parse(data);
    } catch (parseErr) {
      console.error("Error parsing subscribers file:", parseErr);
      return res
        .status(500)
        .json({ error: "Server error while parsing subscribers file." });
    }

    // Find the subscriber
    const subscriber = subscribers.find((entry) => entry.email === email);

    console.log("LOOKING FOR:", email);
    console.log("All subscribers:", subscribers);
    console.log("Found subscriber:", subscriber);

    // Safely get the subscriber's name with fallback
    const userName =
      subscriber && subscriber.name ? subscriber.name : "Subscriber";

    if (!subscriber) {
      console.log("Email not found in subscribers list:", email);
      return res.status(404).json({ error: "Email not found." });
    }

    const updatedSubscribers = subscribers.filter(
      (entry) => entry.email !== email
    );

    fs.writeFile(
      subscribersPath,
      JSON.stringify(updatedSubscribers, null, 2),
      (writeErr) => {
        if (writeErr) {
          console.error("Error writing updated subscribers file:", writeErr);
          return res
            .status(500)
            .json({ error: "Server error while updating file." });
        }

        console.log("Successfully deleted email:", email);

        const mailOptions = {
          from: '"Reminders App" <samy@reminders.com>',
          to: email,
          subject: "Goodbye from Reminders!",
          html: `
            <div style="font-family: 'Quicksand', sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #f1356d; text-align: center;">Goodbye, ${userName}!</h2>
              <p>We’re sorry to see you go. Your subscription to Reminders has been canceled.</p>
              <p style="margin-top: 20px;">If you change your mind, you’re always welcome to come back. We’ll be here to help you stay organized and on top of your important dates.</p>
              <p style="text-align: center; margin-top: 30px;">
                <a href="https://family-reminders.netlify.app/" style="color: white; background-color: #f1356d; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">Resubscribe to Reminders</a>
              </p>
              <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="font-size: 0.9em; color: #666; text-align: center;">This email was sent automatically. If you have any concerns, contact us at <a href="mailto:support@remindersapp.com" style="color: #f1356d;">support@remindersapp.com</a>.</p>
            </div>
          `,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error("Error sending farewell email:", err);
            return res
              .status(500)
              .json({ error: "Failed to send farewell email." });
          }

          const previewUrl = nodemailer.getTestMessageUrl(info);
          console.log("Farewell email sent. Preview URL:", previewUrl);

          res.status(200).json({
            message: "Subscription deleted successfully.",
            previewUrl,
          });
        });
      }
    );
  });
});

// Set up JSON Server for the database
const router = jsonServer.router(config.dbPath);
app.use("/api", router);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Route to get the full subscribers list
app.get("/subscribe", (req, res) => {
  console.log("GET /subscribe called");

  fs.readFile(subscribersPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading subscribers file:", err);
      return res
        .status(500)
        .json({ error: "Failed to read subscribers file." });
    }

    try {
      const subscribers = JSON.parse(data); // Parse the file content into JSON
      console.log("Returning subscribers list:", subscribers);
      res.status(200).json(subscribers); // Send subscribers as JSON
    } catch (parseErr) {
      console.error("Error parsing subscribers file:", parseErr);
      res.status(500).json({ error: "Failed to parse subscribers file." });
    }
  });
});

const cron = require("node-cron");

// Function to handle daily email tasks
const dailyTask = () => {
  console.log("Running daily email task...");

  // Use the current date in UTC
  const today = new Date().toISOString().split("T")[0];
  console.log("Today's date (UTC):", today);

  // Load reminders from db.json
  let reminders = [];
  try {
    reminders = JSON.parse(fs.readFileSync(remindersPath, "utf8")).reminders;
    console.log("Reminders loaded:", reminders);
  } catch (err) {
    console.error("Error reading reminders:", err);
    return;
  }

  // Filter reminders for today's date
  const todaysReminders = reminders.filter(
    (reminder) => reminder.date === today
  );
  console.log("Today's reminders:", todaysReminders);

  if (todaysReminders.length === 0) {
    console.log("No reminders for today.");
    return;
  }

  // Load subscribers from subscribers.json
  let subscribers = [];
  try {
    subscribers = JSON.parse(fs.readFileSync(subscribersPath, "utf8"));
    console.log("Subscribers loaded:", subscribers);
  } catch (err) {
    console.error("Error reading subscribers:", err);
    return;
  }

  // Send emails to all subscribers for today's reminders
  todaysReminders.forEach((reminder) => {
    subscribers.forEach((subscriber) => {
      console.log(
        `Preparing email for ${subscriber.email} for reminder: ${reminder.title}`
      );

      const mailOptions = {
        from: '"Reminders App" <no-reply@reminders.com>',
        to: subscriber.email,
        subject: `Reminder: ${reminder.title}`,
        html: `
          <div style="font-family: 'Quicksand', sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #f1356d; text-align: center;">Hi ${
              subscriber.name || "there"
            },</h2>
            <p style="text-align: center;">We’re sending you a friendly reminder!</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <th style="background-color: #f1356d; color: white; padding: 8px; text-align: left; font-weight: 500;">Detail</th>
                <th style="background-color: #f1356d; color: white; padding: 8px; text-align: left; font-weight: 500;">Information</th>
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
            <p style="margin-top: 20px;">We hope this reminder helps you stay organized. Let us know if you have any questions or feedback!</p>
            <p style="text-align: center; margin-top: 30px;">
              <a href="https://family-reminders.netlify.app/" style="color: white; background-color: #f1356d; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">Visit Reminders App</a>
            </p>
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 0.9em; color: #666; text-align: center;">This email was sent automatically. If you have any concerns, contact us at <a href="mailto:support@remindersapp.com" style="color: #f1356d;">support@remindersapp.com</a>.</p>
          </div>
        `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(
            `Error sending email to ${subscriber.email}:`,
            err.message
          );
        } else {
          console.log(`Email successfully sent to ${subscriber.email}`);
        }
      });
    });
  });
};

// Schedule the task to run at midnight (Ottawa time) every day
cron.schedule("0 5 * * *", dailyTask); // Runs at 5:00 AM UTC, midnight in Ottawa

// cron.schedule("* * * * *", dailyTask); // For testing purposes, will check the DB every minute
