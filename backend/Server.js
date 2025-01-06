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

console.log("Database Path:", config.dbPath); // Logs the absolute path for debugging

// Path to subscribers.json
const subscribersPath = path.join(__dirname, "data", "subscribers.json");

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Set up Ethereal transporter
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "tyreek.langworth43@ethereal.email",
    pass: "dpSVEhCTJ3Wqrmnhy1",
  },
});

// Route to handle subscription
app.post("/subscribe", async (req, res) => {
  console.log("POST /subscribe called");
  const { name, email } = req.body;

  if (!name || !email) {
    console.log("Missing name or email");
    return res.status(400).json({ error: "Name and email are required." });
  }

  // Email content WITH USERNAME
  const mailOptions = {
    from: '"Reminders App" <no-reply@reminders.com>',
    to: email,
    subject: "Welcome to Reminders!",
    text: `Hi ${name}, thank you for subscribing to Reminders!`,
    html: `<p>Hi <b>${name}</b>, thank you for subscribing to Reminders!</p>`,
  };

  try {
    console.log("Sending email to:", email);
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

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
            previewUrl: nodemailer.getTestMessageUrl(info),
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
    const subscriber = subscribers.find(
      (subscriber) => subscriber.email === email
    );

    const user = subscriber.name;

    console.log("Subscriber object retrieved:", subscriber); // Log the subscriber object

    if (!subscriber) {
      console.log("Email not found in subscribers list:", email);
      return res.status(404).json({ error: "Email not found." });
    }

    const updatedSubscribers = subscribers.filter(
      (subscriber) => subscriber.email !== email
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

        // Send the farewell email WITH USERNAME
        const mailOptions = {
          from: '"Reminders App" <no-reply@reminders.com>',
          to: email,
          subject: "Goodbye from Reminders!",
          html: `<p>Hi <b>${user}</b>, thank you for subscribing to Reminders!</p>`,
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

app.get("/subscribe", (req, res) => {
  console.log("GET /subscribe called");

  // Read the subscribers file
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

app.post("/subscribe/send-farewell", (req, res) => {
  const { email, name } = req.body;

  // Email content
  const mailOptions = {
    from: '"Reminders App" <no-reply@reminders.com>',
    to: email,
    subject: "Goodbye from Reminders!",
    html: `<p>Hi {<b>${name || "Subscriber"}}</b>,</p>
           <p>We're sorry to see you go. You can always subscribe again if you change your mind!</p>`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error sending farewell email:", err);
      return res.status(500).json({ error: "Failed to send farewell email." });
    }

    // Generate and log the Ethereal preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("Farewell email sent:", info.messageId);
    console.log("Preview URL for farewell email:", previewUrl);

    res.status(200).json({ previewUrl });
  });
});
