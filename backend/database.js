const mongoose = require("mongoose");
require("dotenv").config();

// Your MongoDB connection string
const uri = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// Connection event listeners
db.on("connected", () => {
  console.log("Connected to MongoDB successfully!");
});

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

module.exports = db;
