
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Test Express
app.get("/", (req, res) => {
  res.json({ message: "SolarAI Express is running" });
});

// Express calls FastAPI
app.post("/api/predict", async (req, res) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/predict",
      null,
      {
        params: req.body
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "FastAPI error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Could not get a response from FastAPI"
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SolarAI Express running on port ${PORT}`);
});