import WeatherIcon from "./WeatherIcon";

// --- COMPONENT 5: DailyForecast ---
const DailyForecast = ({ data }) => (
  <div className="bg-white/20 backdrop-blur-md rounded-xl shadow-inner p-6 space-y-4">
    <h3 className="text-2xl font-bold text-white text-center">5-Day Forecast</h3>
    <div className="flex justify-between items-center text-white overflow-x-auto gap-2">
      {data.map((day) => (
        <div key={day.day} className="flex-shrink-0 flex flex-col items-center bg-white/20 p-3 rounded-lg w-24">
          <p className="font-bold">{day.day.substring(0, 3)}</p>
          <div className="my-2"><WeatherIcon condition={day.conditions} size="h-12 w-12" /></div>
          <div className="text-center">
            <p className="font-semibold">{day.high}°</p>
            <p className="opacity-70">{day.low}°</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default DailyForecast;