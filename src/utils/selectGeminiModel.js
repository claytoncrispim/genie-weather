
const MODEL_LIST = [
  { name: "gemini-2.5-flash", type: "flash", priority: 1 },
  { name: "gemini-2.5-flash-lite", type: "flash-lite", priority: 2 },
  { name: "gemini-2.5-pro", type: "pro", priority: 3 },
];

const TEST_PROMPT = "Say 'OK' as JSON: {\"message\": \"OK\"}";

/**
 * Ping a Gemini model and measure latency.
 */
const testModel = async (apiKey, model) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:generateContent?key=${apiKey}`;
  const start = performance.now();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: TEST_PROMPT }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });
    const elapsed = performance.now() - start;

    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (text.includes("OK")) {
      return { model: model.name, latency: elapsed };
    } else {
      throw new Error("Unexpected response");
    }
  } catch (err) {
    return { model: model.name, latency: Infinity, error: err.message };
  }
};

/**
 * Automatically pick and cache the fastest available Gemini model.
 */
export const selectBestGeminiModel = async (apiKey) => {
  const cached = localStorage.getItem("bestGeminiModel");
  if (cached) return cached;

  const tests = await Promise.all(MODEL_LIST.map((m) => testModel(apiKey, m)));
  const valid = tests.filter((t) => !t.error);
  const best =
    valid.length > 0
      ? valid.sort((a, b) => a.latency - b.latency)[0].model
      : "gemini-2.5-pro"; // fallback

  localStorage.setItem("bestGeminiModel", best);
  return best;
};
