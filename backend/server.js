import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";



const PORT = process.env.PORT || 3000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Keep this list tight: only models you actually want exposed to the client UI.
const ALLOWED_MODELS = new Set([
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
]);

// Response schema (Gemini "responseSchema" format)
const FORECAST_SCHEMA = {
  type: "OBJECT",
  properties: {
    currentWeather: {
      type: "OBJECT",
      properties: {
        city: { type: "STRING" },
        temperature: { type: "NUMBER" },
        temperatureUnit: { type: "STRING", enum: ["Celsius", "Fahrenheit"] },
        conditions: {
          type: "STRING",
          enum: [
            "Sunny",
            "Cloudy",
            "Partly Cloudy",
            "Rain",
            "Snow",
            "Thunderstorm",
            "Windy",
          ],
        },
      },
      required: ["city", "temperature", "temperatureUnit", "conditions"],
    },
    dailyForecast: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          day: { type: "STRING" },
          high: { type: "NUMBER" },
          low: { type: "NUMBER" },
          conditions: {
            type: "STRING",
            enum: [
              "Sunny",
              "Cloudy",
              "Partly Cloudy",
              "Rain",
              "Snow",
              "Thunderstorm",
              "Windy",
            ],
          },
        },
        required: ["day", "high", "low", "conditions"],
      },
    },
    clothingSuggestion: { type: "STRING" },
    activitySuggestion: { type: "STRING" },
  },
  required: [
    "currentWeather",
    "dailyForecast",
    "clothingSuggestion",
    "activitySuggestion",
  ],
};

function stripCodeFences(text = "") {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function safeModel(input) {
  if (!input) return "gemini-2.5-flash";
  if (ALLOWED_MODELS.has(input)) return input;
  return "gemini-2.5-flash";
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/**
 * POST /api/forecast
 * Body: { prompt: string, model?: string }
 * Returns: JSON object matching FORECAST_SCHEMA
 */
app.post("/api/forecast", async (req, res) => {
  try {
    if (!GOOGLE_API_KEY) {
      return res
        .status(500)
        .json({ error: "Missing GOOGLE_API_KEY on the server" });
    }

    const { prompt, model } = req.body || {};
    if (typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Missing or invalid 'prompt'" });
    }

    const selectedModel = safeModel(model);

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: FORECAST_SCHEMA,
      },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${GOOGLE_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Try to parse JSON response from Gemini API
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data?.error?.message ||
        data?.error ||
        `Gemini API error (${response.status})`;
      return res.status(response.status).json({ error: message, details: data });
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return res
        .status(500)
        .json({ error: "No text generated from Gemini" });
    }

    const cleaned = stripCodeFences(rawText);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      return res.status(500).json({
        error: "Gemini returned invalid JSON",
        raw: cleaned,
      });
    }

    return res.json(parsed);
  } catch (err) {
    console.error("Backend error:", err);
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
});

// Temporary health check endpoint to verify if routing is working
app.get("/_whoami", (req, res) => {
  res.json({ ok: true, file: "backend/server.js" });
});

// // Log registered routes
// console.log("✅ Registered routes:");
// app._router.stack
//   .filter(r => r.route)
//   .forEach(r => {
//     const methods = Object.keys(r.route.methods).join(",").toUpperCase();
//     console.log(`${methods} ${r.route.path}`);
//   });


app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log("✅ Running backend/server.js from:", process.cwd());
});