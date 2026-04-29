// >> API Configuration & Global State Variables
const apiKey = 'd33240b0e6f1240bb1be4def48a3a041';
let currentWeatherData = null;
let dataSource = 'api'; // --> 'api' or 'import' - tracks data origin
let forecastEnabled = false; // --> Toggle for 7-day forecast display

// >> Weather Image Mapping - Converts weather descriptions to SVG files
// Purpose: Provides consistent visual representation of weather conditions
function getWeatherImage(description) {
    const desc = description.toLowerCase();
    
    // >> Weather condition to image file mapping
    // --> Handles multiple descriptions for same condition (e.g., 'sunny' and 'clear sky')
    const weatherMap = {
        'clear sky': 'day_clear.svg',
        'sunny': 'day_clear.svg',
        'few clouds': 'day_partial_cloud.svg',
        'partly cloudy': 'day_partial_cloud.svg',
        'scattered clouds': 'cloudy.svg',
        'overcast clouds': 'overcast.svg',
        'broken clouds': 'overcast.svg',
        'shower rain': 'day_rain.svg',
        'rain': 'rain.svg',
        'thunderstorm': 'rain_thunder.svg',
        'snow': 'snow.svg',
        'mist': 'mist.svg',
        'fog': 'fog.svg',
        'sleet': 'sleet.svg',
        'drizzle': 'day_rain.svg',
        'light rain': 'day_rain.svg',
        'heavy rain': 'rain.svg'
    };
    
    // >> Search for matching weather condition - First match wins
    for (let [key, value] of Object.entries(weatherMap)) {
        if (desc.includes(key)) {
            return value;
        }
    }
    
    // >> Fallback to cloudy if no weather match found
    return 'cloudy.svg';
}

// >> Main Weather Search Function
// Purpose: Fetches weather data from OpenWeatherMap API and displays it
// Presentation Point: Demonstrates API integration and async data handling
function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    const output = document.getElementById('output');

    // >> Validate user input - check if city field is empty
    if (city === "") {
        output.innerHTML = `
            <div class="alert alert-warning">
                Please enter a city name.
            </div>
        `;
        return;
    }

    // >> Display loading state while fetching data
    output.innerHTML = `<p class="loading">Loading...</p>`;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            // >> Extract relevant weather data from API response
            const temperature = data.main.temp;
            const description = data.weather[0].description;
            const windSpeed = data.wind.speed;
            const humidity = data.main.humidity;
            const cityName = data.name;
            const latitude = data.coord.lat;
            const longitude = data.coord.lon;

            // >> Fetch alerts and forecast data using latitude/longitude
            const alertsUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,daily&appid=${apiKey}`;
            
            // --> Get 7-day forecast from weather API
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            
            // >> Fetch both alerts and forecast concurrently using Promise.all()
            return Promise.all([
                fetch(alertsUrl).then(r => r.json()),
                fetch(forecastUrl).then(r => r.json())
            ]).then(([alertData, forecastData]) => {
                // >> Process 7-day forecast data - consolidate to one entry per day (noon preferred)
                // Presentation Point: Demonstrates data transformation and filtering
                const dailyForecasts = {};
                forecastData.list.forEach(item => {
                    const date = new Date(item.dt * 1000).toLocaleDateString();
                    // --> Prioritize noon forecasts, fallback to first forecast of day
                    if (!dailyForecasts[date] || item.dt_txt.includes('12:00')) {
                        dailyForecasts[date] = {
                            date: date,
                            temp: Math.round(item.main.temp),
                            tempMin: Math.round(item.main.temp_min),
                            tempMax: Math.round(item.main.temp_max),
                            description: item.weather[0].description,
                            humidity: item.main.humidity,
                            windSpeed: item.wind.speed,
                            icon: item.weather[0].main
                        };
                    }
                });
                
                // >> Extract first 7 days of consolidated forecast data
                const forecast = Object.values(dailyForecasts).slice(0, 7);
                
                // >> Return organized data structure for display
                return {
                    weather: {temperature, description, windSpeed, humidity, cityName},
                    latitude: latitude,
                    longitude: longitude,
                    alerts: alertData.alerts || [],
                    forecast: forecast
                };
            });
        })
        .then(result => {
            const {weather, latitude, longitude, alerts, forecast} = result;
            
            // >> Select appropriate weather icon based on conditions
            const weatherImage = getWeatherImage(weather.description);
            
            // >> Build weather alerts section - shows active weather warnings
            let alertsHTML = '';
            // --> Process and display weather alerts if available
            if (alerts.length > 0) {
                alertsHTML = `
                    <div class="alerts-section alerts-section-danger mt-4">
                        <h4 class="alert-title mb-3">⚠️ Weather Alerts</h4>
                `;
                
                alerts.forEach(alert => {
                    const startDate = new Date(alert.start * 1000).toLocaleString();
                    const endDate = new Date(alert.end * 1000).toLocaleString();
                    
                    alertsHTML += `
                        <div class="card alert-card p-3 mb-3 border-danger">
                            <h5 class="card-title text-danger">${alert.event}</h5>
                            <p class="card-text"><small class="text-muted"><strong>Source:</strong> ${alert.sender_name}</small></p>
                            <p class="card-text">${alert.description}</p>
                            <p class="card-text"><small class="text-muted">
                                <strong>Starts:</strong> ${startDate}<br>
                                <strong>Ends:</strong> ${endDate}
                            </small></p>
                        </div>
                    `;
                });
                
                alertsHTML += `</div>`;
            } else {
                alertsHTML = `
                    <div class="alerts-section alerts-section-safe mt-4">
                        <h4 class="alert-title-safe mb-3">✓ No Weather Alerts</h4>
                        <p class="text-success">No active weather alerts detected for this location.</p>
                    </div>
                `;
            }
            
            // >> Record current timestamp for data tracking
            const lastUpdated = new Date().toLocaleString();
            
            // >> Store weather data globally for export and forecast toggle functionality
            currentWeatherData = {
                source: 'json',
                lastUpdated: lastUpdated,
                current: {
                    cityName: weather.cityName,
                    temperature: weather.temperature,
                    description: weather.description,
                    windSpeed: weather.windSpeed,
                    humidity: weather.humidity,
                    latitude: latitude,
                    longitude: longitude
                },
                alerts: alerts,
                forecast: forecast
            };
            forecastEnabled = false;
            document.getElementById('forecastToggleBtn').textContent = '7-Day Forecast: OFF';
            document.getElementById('forecastToggleBtn').classList.remove('btn-danger');
            document.getElementById('forecastToggleBtn').classList.add('btn-warning');
            
            displayWeatherView(weather, weatherImage, alertsHTML, lastUpdated);
        })
        .catch(error => {
            output.innerHTML = `
                <div class="alert alert-danger">
                    Error: ${error.message}
                </div>
            `;
        });
}

// >> User Authentication System - Registration Function
// Purpose: Validates and stores new user accounts in browser localStorage
// Presentation Point: Demonstrates form validation and local data persistence
function register() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const verifyPassword = document.getElementById('regVerifyPassword').value.trim();
    const registerOutput = document.getElementById('registerOutput');

    // >> Step 1: Validate all required fields are filled 
    if (name === "" || email === "" || password === "" || verifyPassword === "") {
        registerOutput.innerHTML = `
            <div class="alert alert-warning">
                Please fill in all fields
            </div>
        `;
        return;
    }

    // >> Step 2: Verify passwords match
    if (password !== verifyPassword) {
        registerOutput.innerHTML = `
            <div class="alert alert-warning">
                Passwords do not match
            </div>
        `;
        return;
    }

    // >> Step 3: Enforce minimum password length for security
    if (password.length < 6) {
        registerOutput.innerHTML = `
            <div class="alert alert-warning">
                Password must be at least 6 characters long
            </div>
        `;
        return;
    }

    // >> Step 4: Check if email already registered - prevent duplicates 
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(user => user.email === email)) {
        registerOutput.innerHTML = `
            <div class="alert alert-danger">
                Email already registered
            </div>
        `;
        return;
    }

    // >> Step 5: Add new user to localStorage and save 
    users.push({
        name: name,
        email: email,
        password: password
    });
    localStorage.setItem('users', JSON.stringify(users));

    registerOutput.innerHTML = `
        <div class="alert alert-success">
            Registration successful! Redirecting to login...
        </div>
    `;

    setTimeout(() => {
        switchToLogin();
    }, 1500);
}

// >> User Authentication System - Login Function
// Purpose: Authenticates user against stored credentials or admin account
// Presentation Point: Demonstrates credential verification and session management
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginOutput = document.getElementById('loginOutput');

    // >> Validate credentials provided 
    if (username === "" || password === "") {
        loginOutput.innerHTML = `
            <div class="alert alert-warning">
                Please enter username and password
            </div>
        `;
        return;
    }

    // >> Retrieve stored users and verify credentials
    // --> Supports both registered users and default admin account 
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    let user = users.find(u => u.email === username || u.name === username);
    
    if ((user && user.password === password) || (username === "admin" && password === "1234")) {
        // >> Valid credentials - set session and show app
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('currentUser', username);
        document.getElementById('loginView').classList.add('d-none');
        document.getElementById('appView').classList.remove('d-none');
        // --> Clear form fields for security
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    } else {
        loginOutput.innerHTML = `
            <div class="alert alert-danger">
                Invalid login credentials
            </div>
        `;
    }
}

// >> UI Navigation - Switch to Registration Form
function switchToRegister() {
    document.getElementById('loginView').classList.add('d-none');
    document.getElementById('registerView').classList.remove('d-none');
    document.getElementById('registerOutput').innerHTML = '';
    // >> Clear previous form data
    document.getElementById('regName').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regVerifyPassword').value = '';
}

// >> UI Navigation - Switch to Login Form
function switchToLogin() {
    document.getElementById('registerView').classList.add('d-none');
    document.getElementById('loginView').classList.remove('d-none');
    document.getElementById('loginOutput').innerHTML = '';
    // >> Clear form fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// >> User Session - Logout Function
function logout() {
    // >> Clear session and return to login screen
    localStorage.removeItem('loggedIn');
    document.getElementById('appView').classList.add('d-none');
    document.getElementById('loginView').classList.remove('d-none');
}

// >> Application Initialization - Runs when page loads
// Purpose: Restores user session if previously logged in
window.onload = function() {
    if (localStorage.getItem('loggedIn') === 'true') {
        document.getElementById('loginView').classList.add('d-none');
        document.getElementById('appView').classList.remove('d-none');
    }
};

// >> Display Current Weather View
// Purpose: Renders weather information in card layout with icons
// Presentation Point: Shows data organization and Bootstrap UI framework usage
function displayWeatherView(weather, weatherImage, alertsHTML, lastUpdated) {
    const output = document.getElementById('output');
    output.innerHTML = `
        <h3 class="mb-3">${weather.cityName}</h3>
        
        <div class="weather-image-container mb-4">
            <img src="../Assets/${weatherImage}" alt="${weather.description}" class="weather-icon">
        </div>

        <div class="row">

            <div class="col-6 mb-3">
                <div class="card weather-box p-3 shadow-sm">
                    <h6>🌡 Temperature</h6>
                    <p>${weather.temperature} °C</p>
                </div>
            </div>

            <div class="col-6 mb-3">
                <div class="card weather-box p-3 shadow-sm">
                    <h6>🌤 Weather</h6>
                    <p>${weather.description}</p>
                </div>
            </div>

            <div class="col-6 mb-3">
                <div class="card weather-box p-3 shadow-sm">
                    <h6>💨 Wind Speed</h6>
                    <p>${weather.windSpeed} m/s</p>
                </div>
            </div>

            <div class="col-6 mb-3">
                <div class="card weather-box p-3 shadow-sm">
                    <h6>💧 Humidity</h6>
                    <p>${weather.humidity}%</p>
                </div>
            </div>

        </div>
        
        ${alertsHTML}
        
        <div class="api-note">
            <small class="text-muted">Last updated by API: ${lastUpdated}</small>
        </div>
    `;
}

// >> Toggle Forecast Display
// Purpose: Switches between current weather and 7-day forecast views
// Presentation Point: Demonstrates state management and dynamic UI updates
function toggleForecastView() {
    if (!currentWeatherData) {
        alert('No weather data available. Please search for a city first.');
        return;
    }
    
    forecastEnabled = !forecastEnabled;
    const btn = document.getElementById('forecastToggleBtn');
    
    if (forecastEnabled) {
        btn.textContent = '7-Day Forecast: ON';
        btn.classList.remove('btn-warning');
        btn.classList.add('btn-danger');
        displayForecastView(currentWeatherData);
    } else {
        btn.textContent = '7-Day Forecast: OFF';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-warning');
        displayCurrentView();
    }
}

// >> Display Current Weather from Cache
// Purpose: Redisplays current weather data without API call
// Presentation Point: Shows data reuse and efficient resource management
function displayCurrentView() {
    if (!currentWeatherData) return;
    
    const current = currentWeatherData.current;
    const alerts = currentWeatherData.alerts || [];
    const lastUpdated = currentWeatherData.lastUpdated;
    const weatherImage = getWeatherImage(current.description);
    
    let alertsHTML = '';
    if (alerts.length > 0) {
        alertsHTML = `
            <div class="alerts-section alerts-section-danger mt-4">
                <h4 class="alert-title mb-3">⚠️ Weather Alerts</h4>
        `;
        
        alerts.forEach(alert => {
            const startDate = new Date(alert.start * 1000).toLocaleString();
            const endDate = new Date(alert.end * 1000).toLocaleString();
            
            alertsHTML += `
                <div class="card alert-card p-3 mb-3 border-danger">
                    <h5 class="card-title text-danger">${alert.event}</h5>
                    <p class="card-text"><small class="text-muted"><strong>Source:</strong> ${alert.sender_name}</small></p>
                    <p class="card-text">${alert.description}</p>
                    <p class="card-text"><small class="text-muted">
                        <strong>Starts:</strong> ${startDate}<br>
                        <strong>Ends:</strong> ${endDate}
                    </small></p>
                </div>
            `;
        });
        
        alertsHTML += `</div>`;
    } else {
        alertsHTML = `
            <div class="alerts-section alerts-section-safe mt-4">
                <h4 class="alert-title-safe mb-3">✓ No Weather Alerts</h4>
                <p class="text-success">No active weather alerts detected for this location.</p>
            </div>
        `;
    }
    
    displayWeatherView(current, weatherImage, alertsHTML, lastUpdated);
}

// >> Display 7-Day Forecast
// Purpose: Renders multi-day weather forecast in card grid layout
// Presentation Point: Demonstrates iteration and conditional rendering of data
function displayForecastView(data) {
    const output = document.getElementById('output');
    const forecast = data.forecast || [];
    const cityName = data.current.cityName;
    
    if (!forecast || forecast.length === 0) {
        output.innerHTML = `
            <div class="alert alert-info">
                No forecast data available.
            </div>
        `;
        return;
    }
    
    let forecastHTML = `
        <h3 class="mb-4">7-Day Forecast - ${cityName}</h3>
        <div class="forecast-container">
    `;
    
    forecast.forEach(day => {
        const weatherImage = getWeatherImage(day.description);
        forecastHTML += `
            <div class="forecast-card">
                <h6 class="forecast-date">${day.date}</h6>
                <img src="../Assets/${weatherImage}" alt="${day.description}" class="forecast-icon">
                <div class="forecast-temp">
                    <div class="temp-box">
                        <small class="temp-label">H</small>
                        <span class="temp-high">${day.tempMax}°</span>
                    </div>
                    <div class="temp-box">
                        <small class="temp-label">L</small>
                        <span class="temp-low">${day.tempMin}°</span>
                    </div>
                </div>
                <p class="forecast-desc">${day.description}</p>
                <div class="forecast-details">
                    <small>Humidity: ${day.humidity}%</small><br>
                    <small>Wind: ${day.windSpeed} m/s</small>
                </div>
            </div>
        `;
    });
    
    forecastHTML += `
        </div>
        <div class="api-note">
            <small class="text-muted">Last updated: ${data.lastUpdated}</small>
        </div>
    `;
    
    output.innerHTML = forecastHTML;
}

// >> Export Weather Data Function
// Purpose: Downloads current weather data as JSON file
// Presentation Point: Demonstrates file generation and download handling
function exportWeatherJSON() {
    if (!currentWeatherData) {
        alert('No weather data to export. Please search for a city first.');
        return;
    }
    
    const dataStr = JSON.stringify(currentWeatherData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weather_${currentWeatherData.current.cityName}_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// >> Import Weather Data Function
// Purpose: Loads previously exported weather data from JSON file
// Presentation Point: Demonstrates file parsing and data validation
function importWeatherJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate JSON structure
            if (!importedData.current || !importedData.current.cityName) {
                alert('Invalid JSON format. Please ensure the file contains weather data.');
                return;
            }
            
            currentWeatherData = importedData;
            dataSource = 'import';
            displayImportedWeather(importedData);
            
            // Reset file input
            event.target.value = '';
        } catch (error) {
            alert('Error reading JSON file: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// >> Display Imported Weather Data
// Purpose: Renders imported weather data with same formatting as API data
// Presentation Point: Shows data source flexibility and consistent UI rendering
function displayImportedWeather(data) {
    const output = document.getElementById('output');
    const current = data.current;
    const alerts = data.alerts || [];
    
    // >> Select weather icon matching imported data conditions
    const weatherImage = getWeatherImage(current.description);
    
    let alertsHTML = '';
    if (alerts.length > 0) {
        alertsHTML = `
            <div class="alerts-section alerts-section-danger mt-4">
                <h4 class="alert-title mb-3">⚠️ Weather Alerts</h4>
        `;
        
        alerts.forEach(alert => {
            const startDate = alert.start ? new Date(alert.start * 1000).toLocaleString() : 'N/A';
            const endDate = alert.end ? new Date(alert.end * 1000).toLocaleString() : 'N/A';
            
            alertsHTML += `
                <div class="card alert-card p-3 mb-3 border-danger">
                    <h5 class="card-title text-danger">${alert.event}</h5>
                    <p class="card-text"><small class="text-muted"><strong>Source:</strong> ${alert.sender_name}</small></p>
                    <p class="card-text">${alert.description}</p>
                    <p class="card-text"><small class="text-muted">
                        <strong>Starts:</strong> ${startDate}<br>
                        <strong>Ends:</strong> ${endDate}
                    </small></p>
                </div>
            `;
        });
        
        alertsHTML += `</div>`;
    } else {
        alertsHTML = `
            <div class="alerts-section alerts-section-safe mt-4">
                <h4 class="alert-title-safe mb-3">✓ No Weather Alerts</h4>
                <p class="text-success">No active weather alerts detected for this location.</p>
            </div>
        `;
    }
    
    const source = data.source === 'json' ? 'From JSON' : 'From API';
    
    output.innerHTML = `
        <h3 class="mb-3">${current.cityName}</h3>
        
        <div class="weather-image-container mb-4">
            <img src="../Assets/${weatherImage}" alt="${current.description}" class="weather-icon">
        </div>

        <div class="row">

            <div class="col-6 mb-3">
                <div class="card weather-box p-3 shadow-sm">
                    <h6>🌡 Temperature</h6>
                    <p>${current.temperature} °C</p>
                </div>
            </div>

            <div class="col-6 mb-3">
                <div class="card weather-box p-3 shadow-sm">
                    <h6>🌤 Weather</h6>
                    <p>${current.description}</p>
                </div>
            </div>

            <div class="col-6 mb-3">
                <div class="card weather-box p-3 shadow-sm">
                    <h6>💨 Wind Speed</h6>
                    <p>${current.windSpeed} m/s</p>
                </div>
            </div>

            <div class="col-6 mb-3">
                <div class="card weather-box p-3 shadow-sm">
                    <h6>💧 Humidity</h6>
                    <p>${current.humidity}%</p>
                </div>
            </div>

        </div>
        
        ${alertsHTML}
        
        <div class="api-note">
            <small class="text-muted">Last updated: ${data.lastUpdated} - ${source}</small>
        </div>
    `;
}