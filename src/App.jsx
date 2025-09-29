import React, { useState } from 'react';

// A function to generate SVG icons for weather conditions.
const getWeatherIcon = (condition, size = "h-24 w-24") => {
  const icons = {
    "Sunny": (
      <svg xmlns="http://www.w3.org/2000/svg" className={`${size} text-yellow-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
    ),
    "Cloudy": (
      <svg xmlns="http://www.w3.org/2000/svg" className={`${size} text-gray-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
    ),
    "Partly Cloudy": (
      <svg xmlns="http://www.w3.org/2000/svg" className={`${size} text-gray-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M22 10a3 3 0 0 0-3-3h-2.207a5.502 5.502 0 0 0-10.702.5"/></svg>
    ),
    "Rain": (
      <svg xmlns="http://www.w3.org/2000/svg" className={`${size} text-blue-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 13.33V16a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2.67"/><path d="M12 2v8"/><path d="m8 10 4 4 4-4"/><path d="M18 16v.01"/></svg>
    ),
    "Snow": (
      <svg xmlns="http://www.w3.org/2000/svg" className={`${size} text-white`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"/><path d="m8 10 4 4 4-4"/><path d="M20 12h-2"/><path d="M6 12H4"/><path d="m16 6-2-2-2 2"/><path d="m10 18 2 2 2-2"/></svg>
    ),
    "Thunderstorm": (
      <svg xmlns="http://www.w3.org/2000/svg" className={`${size} text-yellow-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.74 18.9A5 5 0 0 0 17 14h-2.26a8 8 0 1 0-10.4 9.4Z"/><path d="m13 12-3 5h4l-3 5"/></svg>
    ),
    "Windy": (
      <svg xmlns="http://www.w3.org/2000/svg" className={`${size} text-gray-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1-3.4 3.4 2.5 2.5 0 0 1 3.4-3.4z"/><path d="M12 12H2"/><path d="M15.5 15.5a2.5 2.5 0 1 0-3.4-3.4 2.5 2.5 0 0 0 3.4 3.4z"/><path d="M12 6H2"/><path d="M7 18H2"/></svg>
    ),
    "Default": (
      <svg xmlns="http://www.w3.org/2000/svg" className={`${size} text-gray-300`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
    )
  };
  return icons[condition] || icons["Default"];
}

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const App = () => {
  const [city, setCity] = useState('');
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetForecast = async (e) => {
    e.preventDefault();

    if (!apiKey) {
      setError("API Key is missing. Please check your .env.local file.");
      return;
    }
    if (!city) {
      setError('Please enter a city name.');
      return;
    }

    setLoading(true);
    setError(null);
    setForecast(null);

    const prompt = `What is the current weather and the 5-day forecast for ${city}? Respond in a valid JSON format.`;

    // --- ENUM ADDED TO SCHEMA ---
    // We are now telling the AI that the 'conditions' field MUST be one of the values in this list.
    // This ensures we always get a value that matches one of our icons.
    const schema = {
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
              description: "A brief description of the weather.",
              enum: ["Sunny", "Cloudy", "Partly Cloudy", "Rain", "Snow", "Thunderstorm", "Windy"]
            },
          },
          required: ["city", "temperature", "temperatureUnit", "conditions"],
        },
        dailyForecast: {
          type: "ARRAY",
          description: "An array of 5 objects, each representing the forecast for a day.",
          items: {
            type: "OBJECT",
            properties: {
              day: { type: "STRING", description: "The day of the week (e.g., 'Monday')." },
              high: { type: "NUMBER", description: "The high temperature for the day." },
              low: { type: "NUMBER", description: "The low temperature for the day." },
              conditions: { 
                type: "STRING", 
                description: "A brief description of the day's weather.",
                enum: ["Sunny", "Cloudy", "Partly Cloudy", "Rain", "Snow", "Thunderstorm", "Windy"]
              },
            },
            required: ["day", "high", "low", "conditions"],
          },
        },
      },
      required: ["currentWeather", "dailyForecast"],
    };

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    };

    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
      
      const result = await response.json();
      const jsonResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!jsonResponseText) throw new Error("Invalid response structure from AI.");
      
      const parsedForecast = JSON.parse(jsonResponseText);
      // console.log('Parsed Forecast:', parsedForecast); // Great for debugging!
      setForecast(parsedForecast);

    } catch (err) {
      console.error(err);
      setError('Could not fetch the forecast. The Genie is busy! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-lg bg-white/30 backdrop-blur-md rounded-xl shadow-2xl p-8 space-y-6">
        <h1 className="text-4xl font-bold text-white text-center tracking-wider">Genie Weather</h1>

        <form onSubmit={handleGetForecast} className="flex gap-2">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            className="flex-grow p-3 rounded-lg border-2 border-transparent focus:border-white focus:ring-0 bg-white/50 text-white placeholder-gray-200 transition duration-300 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-blue-500 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-100 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Thinking...' : 'Get Forecast'}
          </button>
        </form>

        {error && <div className="bg-red-500/50 text-white p-3 rounded-lg text-center">{error}</div>}

        {forecast && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-white/30 backdrop-blur-md rounded-xl shadow-inner p-6 flex flex-col items-center text-white space-y-4">
              <h2 className="text-3xl font-semibold">{forecast.currentWeather.city}</h2>
              <div className="flex items-center gap-4">
                {getWeatherIcon(forecast.currentWeather.conditions)}
                <p className="text-6xl font-bold">
                  {forecast.currentWeather.temperature}°{forecast.currentWeather.temperatureUnit === 'Celsius' ? 'C' : 'F'}
                </p>
              </div>
              <p className="text-2xl capitalize">{forecast.currentWeather.conditions}</p>
            </div>

            <div className="bg-white/30 backdrop-blur-md rounded-xl shadow-inner p-6 space-y-4">
              <h3 className="text-2xl font-bold text-white text-center">5-Day Forecast</h3>
              <div className="flex justify-between items-center text-white overflow-x-auto gap-2">
                {forecast.dailyForecast.map((day) => (
                  <div key={day.day} className="flex-shrink-0 flex flex-col items-center bg-white/20 p-3 rounded-lg w-24">
                    <p className="font-bold">{day.day.substring(0, 3)}</p>
                    <div className="my-2">{getWeatherIcon(day.conditions, "h-12 w-12")}</div>
                    <div className="text-center">
                      <p className="font-semibold">{day.high}°</p>
                      <p className="opacity-70">{day.low}°</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="text-xs text-white/70 text-center pt-2">
              Weather data powered by Generative AI. Forecast may be approximate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;