import React, { useState, useEffect } from "react";
import './App.css';

const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

function App() {
  const [input, setInput] = useState("");
  const [city, setCity] = useState("Austin");
  const [cities, setCities] = useState(["Austin", "Dallas", "Houston"]);
  const [timeData, setTimeData] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);

  useEffect(() => {
    fetchData(city);
  }, [city]);

  const fetchData = async (cityName) => {
    try {
        const coordinateResponse = await fetch(
          `${GEOCODING_API_URL}?name=${cityName}&count=1`
        );
      
      const coordinateData = await coordinateResponse.json();

      var latitude;
      var longitude;

      try {
        latitude = coordinateData.results[0].latitude;
        longitude = coordinateData.results[0].longitude;
      }
      catch (error) {
        console.error(`Error fetching latitude and longitude for ${cityName}`)
      }

      const response = await fetch(
        `${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&temperature_unit=fahrenheit`
      );
      const data = await response.json();
        
      const first12HoursTimes = data.hourly.time.slice(0, 12);
      const first12HoursTemperatures = data.hourly.temperature_2m.slice(0, 12);

      setTimeData(first12HoursTimes);
      setTemperatureData(first12HoursTemperatures);
    } catch (error) {
      console.error("Error getting data", error);
    }
  };

  const handleCityButtonClick = (selectedCity) => {
    setCity(selectedCity);
  };

  const parseTimestampToTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    let formattedHours = hours % 12;
    formattedHours = formattedHours === 0 ? 12 : formattedHours;

    const amPm = hours < 12 ? "AM" : "PM";

    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${formattedHours}:${formattedMinutes} ${amPm}`;
  };

  const handleAddCity = async () => {
    try {
      if (input.trim() !== "") {
        setCities([...cities, input]);
        setInput("");
        setCity(input)
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getButtonClassName = (cityName) => {
    return (cityName === city) ? "selected-city-button" : "city-button";
  };
  

  return (
    <div className="container">
      <h1>Weather Forecast for {city || ""}</h1>
      
     
      {cities.map((cityName) => (
        <button key={cityName} onClick={() => handleCityButtonClick(cityName)}         className={getButtonClassName(cityName)}
>
          {cityName}
        </button>
      ))}
      <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter city name"
        className="input-box"
      />
            <button onClick={handleAddCity} className="add-button">+</button>

      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Temperature (°F)</th>
            </tr>
          </thead>
         <tbody>
            {timeData.map((time, index) => (
              <tr key={index}>
                <td className="time-column">{parseTimestampToTime(time)}</td>
                <td className="temperature-column">{Math.round(temperatureData[index])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
