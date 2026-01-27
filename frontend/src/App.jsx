import { useState, useEffect } from 'react';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import SearchBar from './components/SearchBar.jsx';
import CurrentWeather from './components/CurrentWeather.jsx';
import DailyForecast from './components/DailyForecast.jsx';
import Recommendations from './components/Recommendations.jsx';


// --- CONFIGURATION ---
const API_BASE_URL =
  import.meta.env.VITE_RENDER_BACKEND_URL ??
  (import.meta.env.PROD ? "" : "http://localhost:3000");

const backendLabel = API_BASE_URL || "(same origin)";

// Toggle via URL: ?debug=1
const isDebugEnabled =
  new URLSearchParams(window.location.search).get("debug") === "1";

// Detect common "oops" situations
const hostname = window.location.hostname;
const isGitHubPagesHost = hostname.endsWith("github.io");

const isLocalhostBackend =
  backendLabel.includes("localhost") || backendLabel.includes("127.0.0.1");

// This is the actual misconfig we care about:
const shouldWarnBackendMismatch =
  isGitHubPagesHost && isLocalhostBackend;

// Show current build mode in ?debug=1
const buildMode = import.meta.env.PROD ? "PROD build" : "DEV build";

// Show whether the env var is present
const hasEnvBackend = Boolean(import.meta.env.VITE_RENDER_BACKEND_URL);


// --- HELPERS ---
// --- RETRY HELPER FUNCTION ---
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(
    url, 
    options = {}, 
    { retries = 2, delay = 4000 } = {}
) {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, options);

            // If it's a "cold backend" style status, retry a couple of times
            if (!res.ok && [502, 503, 504].includes(res.status) && attempt < retries) {
                console.warn(
                  `Request to ${url} failed with status ${res.status}. Retrying in ${delay}ms... (Attempt ${
                      attempt + 1
                  } of ${retries + 1})`
                );
                await sleep(delay);
                continue;
            }

            // Return the response *even if* it's not ok.
            // callGemini / other callers will inspect res.ok / res.status.
            return res;
            } catch (err) {
              lastError = err;
              console.warn(`Request to ${url} failed on attempt ${attempt}:`, err);

              if (attempt < retries) {
                  await sleep(delay);
                  continue;
            }

            // All retries exhausted → propagate network error
            throw lastError;
            }
        }

        // Should never reach here, but just in case:
        throw lastError || new Error("Unknown error in fetchWithRetry");
  }

// --- GEMINI API CALL FUNCTION ---
// Helper function for Gemini initialization
const callGemini = async (prompt, model) => {
    let response;
    try {
        // if (!API_BASE_URL) {
        //   throw new Error("Missing VITE_RENDER_BACKEND_URL in production build.");
        // }

        response = await fetchWithRetry(
            `${API_BASE_URL}/api/forecast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, model }),
        });
    } catch (networkErr) {
        // Network, CORS, or backend not runnning error
        const err = new Error("NETWORK_ERROR");
        err.cause = networkErr;
        throw err;
    }

    let data;
    try {
        data = await response.json();
    } catch (parseErr) {
        const err = new Error("INVALID_JSON_FROM_SERVER");
        err.status = response.status;
        err.cause = parseErr;
        throw err;
    }

    if (!response.ok) {
        // Backend returned an error status
        const message =
            data?.error ||
            `Server returned an error (${response.status}). Please try again`;

        const err = new Error(message);
        err.status = response.status;
        throw err;
    }

    // The backend now returns structured JSON, so we return it directly
    if (!data || typeof data !== "object") {
        throw new Error("UNEXPECTED_RESPONSE_SHAPE");
    }

    return data;
}

// --- DYNAMIC STYLING: Get background based on weather ---
const getBackgroundStyle = (condition) => {
    const defaultStyle = "from-blue-400 to-purple-600";
    if (!condition) return defaultStyle;

    const conditionMap = {
        "Sunny": "from-sky-400 to-orange-300",
        "Cloudy": "from-slate-400 to-gray-600",
        "Partly Cloudy": "from-sky-500 to-slate-400",
        "Rain": "from-slate-500 to-blue-800",
        "Snow": "from-slate-300 to-cyan-200",
        "Thunderstorm": "from-slate-800 to-indigo-900",
        "Windy": "from-sky-300 to-gray-400",
    };
    return conditionMap[condition] || defaultStyle;
};

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const App = () => {
  const [model, setModel] = useState(localStorage.getItem('overrideGeminiModel') || null);
  const [autoModel, setAutoModel] = useState(null);
  const [city, setCity] = useState('');
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCooldown, setIsCooldown] = useState(false);

  useEffect(() => {
    const lastCity = localStorage.getItem('genieWeatherLastCity');
    if (lastCity) {
        setCity(lastCity);
    } else {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                handleGetForecast({ latitude, longitude });
            },
            (err) => {
                console.warn("User denied geolocation. Waiting for manual input.");
            }
        );
    }
  }, []);

  useEffect(() => {
    if (forecast?.currentWeather?.city) {
      localStorage.setItem('genieWeatherLastCity', forecast.currentWeather.city);
    }
  }, [forecast]);

  useEffect(() => {
    (async () => {
      if (!apiKey) return;
      const best = await selectBestGeminiModel(apiKey);
      setAutoModel(best);
    })();
  }, []);

  const handleGetForecast = async (location) => {
      
      if (typeof location === 'string') {
          const trimmedLocation = location.trim();
          if (!trimmedLocation) {
            setError('Please enter a valid city name.');
            return;
          }
          location = trimmedLocation;
      }
      let prompt;
      if (typeof location === "string") {
          prompt = `What is the current weather and 5-day forecast for ${location}? Also, provide a brief suggestion for clothing and one for an activity. Respond in a valid JSON format.`;
      } else if (
          location &&
          typeof location === "object" &&
          typeof location.latitude === "number" &&
          typeof location.longitude === "number"
      ) {
          prompt = `What is the current weather and 5-day forecast for the location at latitude ${location.latitude} and longitude ${location.longitude}? Also, provide a brief suggestion for clothing and one for an activity. Respond in a valid JSON format.`;
    } else {
        setError('Invalid location provided.');
        return;
    }
    
    setLoading(true);
    setIsCooldown(true);
    setError(null);
    setForecast(null);


    try {
      const selectedModel = typeof model === "string" ? model : undefined;
      // Call Gemini via backend (API key stays on the server)
      const backendResponse = await callGemini(prompt, selectedModel);
      setForecast(backendResponse);
      if (typeof location === 'string') {
        setCity(location);
      } else {
        setCity(backendResponse.currentWeather.city);
      }
    } catch (err) {
      console.error(err);
      setError('Could not fetch the forecast. The Genie is busy! Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setIsCooldown(false), 2000);
    }
  };
  
  const backgroundClass = getBackgroundStyle(forecast?.currentWeather?.conditions);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundClass} flex items-center justify-center font-sans p-4 transition-all duration-1000`}>
      <div className="w-full max-w-lg bg-white/20 backdrop-blur-md rounded-xl shadow-2xl sm:p-8 space-y-6">

        {/* Debug chip (only when ?debug=1) */}
        {isDebugEnabled && (
          <div className="space-y-2">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(backendLabel)} catch {
                      // fallback: show a prompt the use can copy from
                      window.prompt("Copy backend URL:", backendLabel);
                    }
                }}
                className="text-[11px] px-2 py-1 rounded-full bg-white/20 text-white/80 border border-white/20 hover:bg-white/30 transition"
                title="Click to copy"
              >
                Backend: {backendLabel}
              </button>
            </div>

            {shouldWarnBackendMismatch && (
              <div className="mx-auto max-w-md text-center text-xs px-3 py-2 rounded-lg bg-yellow-400/20 text-yellow-100 border border-yellow-200/30">
                ⚠️ You’re on GitHub Pages (<code className="font-mono">{hostname}</code>)
                but the app is configured to call <b>localhost</b>.  
                Set <code className="font-mono">VITE_RENDER_BACKEND_URL</code> to your Render URL
                for the Pages build.
              </div>
            )}
            <div className="text-center text-[11px] text-white/70">
              {buildMode} • VITE_RENDER_BACKEND_URL: {hasEnvBackend ? "set" : "not set"}
            </div>
          </div>
        )}

        {/* Header */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center tracking-wider">Genie Weather</h1>
        <p className="text-sm text-white/70 text-center">Get the latest weather updates powered by AI.</p>

        {/* Model selector dropdown */}
        <div className="flex justify-center items-center gap-2 text-white text-sm">
          <label htmlFor="model" className="opacity-80">Model:</label>
          <select
            id="model"
            value={model || autoModel || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "auto") {
                setModel(null);
                localStorage.removeItem("overrideGeminiModel");
              } else {
                setModel(value);
                localStorage.setItem("overrideGeminiModel", value);
              }
            }}
            // By default: white text  - When listing options: blue text for selected
            className="
              appearance-none
              bg-white/15 hover:bg-white/25
              text-white
              border border-white/40
              rounded-lg px-3 py-1
              focus:outline-none focus:ring-2 focus:ring-white/60
              transition duration-200
              backdrop-blur-md
            "
            style={{
              WebkitAppearance: 'none',
              MozAppearance: 'none',
            }}
          >
            <option value="auto" className="text-blue-600 bg-white">Auto ({autoModel || "detecting..."})</option>
            <option value="gemini-2.5-flash" className="text-blue-600 bg-white">Gemini Flash</option>
            <option value="gemini-2.5-flash-lite" className="text-blue-600 bg-white">Gemini Flash Lite</option>
            <option value="gemini-2.5-pro" className="text-blue-600 bg-white">Gemini Pro</option>
          </select>
        </div>

        {/* <button
          onClick={() => {
            localStorage.removeItem("bestGeminiModel");
            setAutoModel(null);
            alert("Auto-model cache cleared. It will re-detect next time.");
          }}
          className="text-xs text-white/70 underline ml-2 text-center"
        >
          Reset Auto-Detect
        </button> */}

        <SearchBar city={city} setCity={setCity} handleGetForecast={handleGetForecast} loading={loading} isCooldown={isCooldown} />

        {error && <div className="bg-red-500/50 text-white p-3 rounded-lg text-center">{error}</div>}

        {loading && <LoadingSpinner />}

        {forecast && (
          <div className="animate-fade-in space-y-6">
            <CurrentWeather data={forecast.currentWeather} />
            <DailyForecast data={forecast.dailyForecast} />
            <Recommendations data={forecast} />
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