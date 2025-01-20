const mongoose = require("mongoose");

// Your MongoDB connection string
const uri =
  "mongodb+srv://samytouabi:Nf86ghNLdg2uLwkE@cluster0.kn7yc.mongodb.net/reminders?retryWrites=true&w=majority&appName=Cluster0";

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
