const axios = require("axios");
require("dotenv").config();
let cachedToken = null;
let tokenExpiry = null; // in milliseconds timestamp

const getAccessToken = async () => {
  const now = Date.now();

  // Return cached token if still valid
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post(
      "https://api.amazon.com/auth/o2/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: process.env.REFRESH_TOKEN,
        client_id: process.env.LWA_CLIENT_ID,
        client_secret: process.env.LWA_CLIENT_SECRET,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    // Save token and set expiry (current time + expires_in * 1000)
    cachedToken = response.data.access_token;
    tokenExpiry = now + response.data.expires_in * 1000; // usually 3600 seconds = 1 hour
console.log(cachedToken)
    return cachedToken;
  } catch (error) {
    if (error.response) {
      console.error("Access token error response data:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw new Error("Unable to fetch LWA access token");
  }
};

module.exports = getAccessToken;
