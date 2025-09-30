Genie Weather 🧞‍♂️

Welcome to Genie Weather, a smart, AI-powered weather forecast application that provides more than just data—it offers personalized advice and a dynamic, immersive experience.

✨ Key Features

    AI-Powered Forecasts: Utilizes the Google Gemini API to fetch real-time weather data and 5-day forecasts with natural language prompts.

    "True Genie" Recommendations: The AI analyzes the forecast to provide personalized advice on what to wear and suggests suitable indoor or outdoor activities.

    Automatic Geolocation: On first load, the app intelligently asks for your location to provide the weather for where you are, right now.

    Dynamic UI & Backgrounds: The entire app's background gradient changes to reflect the current weather conditions (e.g., a warm orange for "Sunny," a cool blue for "Rain").

    Robust & Resilient: Built with professional error handling, rate-limiting cooldowns, and a polished loading state to ensure a smooth user experience.

    Clean, Modern Tech Stack: Built with React, Vite, and Tailwind CSS, all structured into clean, reusable components.

🛠️ Technologies Used

    Frontend: React, Vite

    Styling: Tailwind CSS

    AI/API: Google Gemini API (for structured JSON generation)

    Browser APIs: Geolocation, Local Storage

🚀 Getting Started

To run this project locally, follow these steps:

    Clone the repository:
```sh
    git clone [https://github.com/claytoncrispim/genie-weather.git](https://github.com/claytoncrispim/genie-weather.git)
```
```sh
    cd genie-weather
```
    Install dependencies:
```sh
    npm install
```

    Set up your API Key:

        Create a file named .env.local in the root of the project.

        Add your Gemini API key to this file:
```sh
    VITE_GEMINI_API_KEY=your_api_key_here
```
    Run the development server:
```sh
    npm run dev
```