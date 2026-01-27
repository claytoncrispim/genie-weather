import WeatherIcon from './WeatherIcon.jsx';

// --- COMPONENT 4: CurrentWeather ---
const CurrentWeather = ({ data }) => (
  <div className="bg-white/20 backdrop-blur-md rounded-xl shadow-inner p-6 flex flex-col items-center text-white space-y-4">
    <h2 className="text-3xl font-semibold">{data.city}</h2>
    <div className="flex items-center gap-4">
      <WeatherIcon condition={data.conditions} />
      <p className="text-6xl font-bold">
        {data.temperature}°{data.temperatureUnit === 'Celsius' ? 'C' : 'F'}
      </p>
    </div>
    <p className="text-2xl capitalize">{data.conditions}</p>
  </div>
);

export default CurrentWeather;