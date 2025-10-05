import { useState, useEffect } from "react";
import axios from "axios";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // Fetch current weather
  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) {
      setError("⚠️ Please enter a city name.");
      return;
    }
    try {
      setError("");
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          cityName
        )}&appid=${API_KEY}&units=metric`
      );
      setWeather(res.data);
    } catch (err) {
      console.error("Weather error:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError("🔑 Invalid API key. Check your .env file.");
      } else if (err.response?.data?.message === "city not found") {
        setError("❌ City not found. Try again.");
      } else {
        setError("⚡ Unable to fetch weather data.");
      }
      setWeather(null);
    }
  };

  // Fetch 5-day forecast
  const fetchForecast = async (cityName) => {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          cityName
        )}&appid=${API_KEY}&units=metric`
      );
      // pick entries around midday (12:00:00)
      const dailyData = res.data.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );
      setForecast(dailyData);
    } catch (err) {
      console.error("Forecast error:", err.response?.data || err.message);
      setForecast([]);
    }
  };

  // Load Kaduna, NG by default
  useEffect(() => {
    const defaultCity = "Kaduna,NG";
    fetchWeather(defaultCity);
    fetchForecast(defaultCity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search form
  const handleSearch = (e) => {
    e.preventDefault();
    if (!city.trim()) {
      setError("⚠️ Please enter a city name.");
      return;
    }
    fetchWeather(city);
    fetchForecast(city);
    setCity("");
  };

  return (
    <div className="app-wrapper">
      <div className="weather-container">
        <h1 className="app-title">🌦 Weather App Developed by Mubarak Adam</h1>

        {/* Search Box */}
        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter city (e.g. Lagos,NG or Kaduna)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label="City name"
          />
          <button type="submit">Search</button>
        </form>

        {/* Error */}
        {error && <p className="error-msg">{error}</p>}

        {/* Main content: current + forecast */}
        <div className="weather-main">
          {/* Current Weather */}
          {weather && (
            <section className="weather-card" aria-live="polite">
              <h2 className="card-title">
                {weather.name}, {weather.sys.country}
              </h2>

              <div className="temp-row">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                  className="big-icon"
                />
                <div className="temp-block">
                  <div className="temp-value">{Math.round(weather.main.temp)}°C</div>
                  <div className="temp-desc capitalize">
                    {weather.weather[0].description}
                  </div>
                </div>
              </div>

              <div className="meta-row">
                <div>Feels like: {Math.round(weather.main.feels_like)}°C</div>
                <div>Humidity: {weather.main.humidity}%</div>
                <div>Wind: {weather.wind.speed} m/s</div>
              </div>
            </section>
          )}

          {/* Forecast */}
          {forecast.length > 0 && (
            <aside className="forecast">
              <h3 className="forecast-title">5-Day Forecast</h3>
              <div className="forecast-grid" role="list">
                {forecast.map((day, idx) => (
                  <div className="forecast-day" key={idx} role="listitem">
                    <div className="day-name">
                      {new Date(day.dt_txt).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                      alt={day.weather[0].description}
                      className="day-icon"
                    />
                    <div className="day-temp">{Math.round(day.main.temp)}°C</div>
                    <div className="day-desc capitalize">{day.weather[0].description}</div>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default Weather;

