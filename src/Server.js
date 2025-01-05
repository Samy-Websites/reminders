const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Set up Ethereal transporter
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email", // SMTP server hostname
  port: 587, // Secure port for STARTTLS
  auth: {
    user: "nia.gutmann@ethereal.email", // Ethereal username
    pass: "cE5G8h2gQJqPwjNe23", // Ethereal password
  },
  secure: false, // Use STARTTLS
});

// Route to handle subscription
app.post("/subscribe", async (req, res) => {
  const { name, email } = req.body;

  // Email content
  const mailOptions = {
    from: '"Reminders App" <no-reply@reminders.com>', // Sender address
    to: email, // Receiver's email address
    subject: "Welcome to Reminders!",
    text: `Hi ${name}, thank you for subscribing to Reminders!`, // Plain text content
    html: `<p>Hi <b>${name}</b>, thank you for subscribing to Reminders!</p>`, // HTML content
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info)); // Preview URL for testing
    res
      .status(200)
      .send({
        message: "Email sent successfully!",
        previewUrl: nodemailer.getTestMessageUrl(info),
      });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ message: "Error sending email." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
