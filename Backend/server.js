require("dotenv").config();
const { MongoClient } = require("mongodb");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path"); // Make sure to include 'path' for serving static files

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Hardcoded MongoDB connection string
const mongoURI = "mongodb+srv://sonacse2425:Sona%40Cse%402425@studententry.6cwjonx.mongodb.net/?retryWrites=true&w=majority&appName=StudentEntry";

// Connect to MongoDB using Mongoose
mongoose
  .connect(mongoURI)
  .then(() => {
    app.listen(5000, () => {
      console.log("Connected to db & listening on port 5000!!!");
    });
  })
  .catch((error) => {
    console.log(error);
  });

// MongoDB Client Initialization
const client = new MongoClient(mongoURI);
const db = client.db("ece_entry"); // Get the connected database
const Student_collection = db.collection("students"); // Specify the collection name
const Search_collection = db.collection("searches"); // Specify the collection name

// Endpoint to get student details by barcode number
app.get("/student/:barcode", async (req, res) => {
  try {
    const student = await Student_collection.findOne({
      barcode: req.params.barcode,
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Endpoint to store search details
app.post("/entry", async (req, res) => {
  try {
    const newSearch = req.body; // Assuming req.body has the correct structure
    const result = await Search_collection.insertOne(newSearch);
    res.status(201).json({ message: "Search details saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Endpoint to handle filter requests
app.get("/filter", async (req, res) => {
  const selectedDate = req.query.date;
  const regexDate = new RegExp("^" + selectedDate);

  try {
    const data = await Search_collection.find({ entryAt: regexDate }).toArray();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Simulated database of users
const users = [
  { username: "admin123", password: "admin123" },
  { username: "user2", password: "password2" },
];

// Login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  res.json({ message: "Login successful", user: user });
});

// Serve frontend
app.use(express.static("./frontend/build"));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./frontend/build/index.html"));
});

// Start the server
app.listen(848, () => {
  console.log(`App is listening at port 848`);
});
