# Weather App SPA

A Single Page Application (SPA) weather dashboard built for **COMP1004 Computing Practice**. The application allows users to search for live weather data using the OpenWeather API and view current conditions, alerts, short-term forecast data, and imported/exported JSON weather files.

---

## Features

* Search weather by city name
* Current temperature, humidity, wind speed, and conditions
* Weather alert notifications
* 7-day forecast overview
* Dynamic SVG weather imagery
* JSON export of current weather data
* JSON import without requiring an API request
* Login / register prototype using LocalStorage
* Responsive Bootstrap user interface
* SPA view switching between login and application views

---

## Technologies Used

* HTML5
* CSS3
* Bootstrap 5
* JavaScript (ES6)
* OpenWeather API
* LocalStorage
* SVG weather icons (Dovora CC BY-SA 4.0)

---

## Installation / Running the Project

1. Clone or download the project files.
2. Open the project folder in VS Code.
3. Ensure all assets and SVG weather icons are stored in the correct `Assets/` folder.
4. Open `index.html` in a browser **or** run with Live Server.
5. Enter a city name and click **Search**.

---

## API Setup

This project uses the OpenWeather API.

Replace the API key in `script.js`:

```javascript
const apiKey = 'YOUR_API_KEY';
```

Get your API key from: [https://openweathermap.org/api](https://openweathermap.org/api)

---

## Project Structure

```text
project/
│── index.html
│── style.css
│── script.js
│── Assets/
│   ├── cloudy.svg
│   ├── rain.svg
│   ├── day_clear.svg
│   └── ...
```

---

## Known Limitations

* Authentication is prototype-only and uses LocalStorage
* API key is client-side for coursework demonstration
* Forecast data is based on OpenWeather forecast endpoint availability
* No backend database integration

---

## Future Improvements

* Backend authentication with encrypted passwords
* Geolocation weather lookup
* Extended multi-day forecasting
* Theme switching (dark/light mode)
* User preference persistence

---

## Author

Developed as part of **COMP1004 Computing Practice**.

---

## Credits

Weather icons adapted from the **Simplistic Weather Icon Pack** by Dovora Interactive, licensed under **CC BY-SA 4.0**.
