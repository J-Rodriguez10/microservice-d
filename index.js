// EX: http://localhost:4000/mars-weather

// Import required modules
const express = require("express");
const axios = require("axios");
require("dotenv").config(); // Load environment variables
const cors = require("cors"); // Import CORS

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to parse JSON requests
app.use(express.json());

// Enable CORS for all origins 
app.use(cors()); 

// Basic route
app.get("/", (req, res) => {
  res.send("Welcome to the InSight Mars Weather Microservice!");
});

// Function to fetch Mars Weather data
async function fetchMarsWeather() {
  const nasaApiUrl = "https://api.nasa.gov/insight_weather/"; // InSight Weather API endpoint
  const apiKey = process.env.NASA_API_KEY;

  try {
    // Fetch data from the InSight Mars Weather API
    const response = await axios.get(nasaApiUrl, {
      params: {
        api_key: apiKey,
        feedtype: "json",
        ver: "1.0",
      },
    });

    // Extract and structure the relevant data
    const weatherData = response.data;

    if (!weatherData.sol_keys || weatherData.sol_keys.length === 0) {
      return { message: "No data available for recent Sols." };
    }

    // Map over the sol keys and extract relevant data
    const formattedData = weatherData.sol_keys.map((sol) => ({
      sol: sol,
      temperature: {
        min: weatherData[sol].AT?.mn || "N/A",
        max: weatherData[sol].AT?.mx || "N/A",
        average: weatherData[sol].AT?.av || "N/A",
      },
      pressure: weatherData[sol].PRE?.av || "N/A",
      wind: {
        speed: weatherData[sol].HWS?.av || "N/A",
        direction: weatherData[sol].WD?.most_common?.compass_point || "N/A",
      },
      season: weatherData[sol].Season || "N/A",
    }));

    return formattedData;
  } catch (error) {
    console.error("Error fetching Mars weather data:", error.message);
    throw new Error("Failed to retrieve Mars weather data.");
  }
}

// Route to get Mars weather data
app.get("/mars-weather", async (req, res) => {
  try {
    const weatherData = await fetchMarsWeather();
    res.json(weatherData);
  } catch (error) {
    console.error("Error in /mars-weather route:", error.message);
    res.status(500).json({ error: "Failed to retrieve Mars weather data" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("Now waiting for Mars weather fetch requests...");
});
