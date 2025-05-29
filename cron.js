// cron.js
const cron = require("node-cron");
const axios = require("axios");

const lat = 14.7006;
const lng = 120.9836;
const BASE_URL = process.env.BASE_URL || "https://ts-backend-1-jyit.onrender.com";

// 🕒 1. Gas Station Import (3:00 AM)
cron.schedule("0 3 * * *", async () => {
  console.log("[CRON] Running gas station import task...");
  try {
    const res = await axios.get(`${BASE_URL}/api/gas-stations/import?lat=${lat}&lng=${lng}`);
    console.log(`[CRON] Success: ${res.data.msg}`);
  } catch (err) {
    console.error("[CRON] Failed to import gas stations:", err.message);
  }
});

// 🕒 2. Generate Daily Analytics (11:59 PM)
cron.schedule("59 23 * * *", async () => {
  console.log("[CRON] Generating daily analytics...");
  try {
    const res = await axios.get(`${BASE_URL}/api/analytics/generate-daily`);
    console.log(`[CRON] Daily analytics done: ${res.data.message}`);
  } catch (err) {
    console.error("[CRON] Daily analytics error:", err.message);
  }
});
