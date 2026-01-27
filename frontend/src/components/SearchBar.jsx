// --- COMPONENT 3: SearchBar ---
const SearchBar = ({ city, setCity, handleGetForecast, loading, isCooldown }) => (
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      handleGetForecast(city); 
    }} 
      className="w-full">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center"> 
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city name..."
        className="
          w-full min-w-0 sm:flex-1
          bg-white/15 hover:bg-white/20
          text-white placeholder:text-white/60
          border border-white/30
          rounded-lg px-4 py-3
          focus:outline-none focus:ring-2 focus:ring-white/50
        "
      />
    
      <button
        type="submit"
        disabled={loading || isCooldown}
        className="
          w-full sm:w-auto sm:shrink-0
          whitespace-nowrap
          bg-white/70 text-blue-500 font-bold
          py-3 px-6
          rounded-lg shadow-lg
          hover:bg-blue-100 transition duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {loading ? 'Thinking...' : 'Get Forecast'}
      </button>
    </div>
  </form>
);
export default SearchBar;