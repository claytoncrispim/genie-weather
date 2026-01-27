// *** UI COMPONENTS ***
// --- COMPONENT 1: WeatherIcon ---
const WeatherIcon = ({ condition, size = "h-24 w-24" }) => {
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
};

export default WeatherIcon;