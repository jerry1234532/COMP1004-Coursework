const apiKey = 'd33240b0e6f1240bb1be4def48a3a041';
let currentWeatherData = null;
let dataSource = 'api'; // 'api' or 'import'

// Map weather conditions to SVG images
function getWeatherImage(description) {
    const desc = description.toLowerCase();
    
    // Map various weather descriptions to image files
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
    
    // Find matching weather condition
    for (let [key, value] of Object.entries(weatherMap)) {
        if (desc.includes(key)) {
            return value;
        }
    }
    
    // Default to cloudy if no match found
    return 'cloudy.svg';
}

function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    const output = document.getElementById('output');

    // <<-- Empty input check -->>
    if (city === "") {
        output.innerHTML = `
            <div class="alert alert-warning">
                Please enter a city name.
            </div>
        `;
        return;
    }

    // <<-- Loading message -->>
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
            // <<-- Extract data -->>
            const temperature = data.main.temp;
            const description = data.weather[0].description;
            const windSpeed = data.wind.speed;
            const humidity = data.main.humidity;
            const cityName = data.name;
            const latitude = data.coord.lat;
            const longitude = data.coord.lon;

            // <<-- Fetch alerts data -->>
            const alertsUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,daily&appid=${apiKey}`;
            
            return fetch(alertsUrl)
                .then(alertResponse => alertResponse.json())
                .then(alertData => ({
                    weather: {temperature, description, windSpeed, humidity, cityName},
                    latitude: latitude,
                    longitude: longitude,
                    alerts: alertData.alerts || []
                }));
        })
        .then(result => {
            const {weather, latitude, longitude, alerts} = result;
            
            // <<-- Get weather image -->>
            const weatherImage = getWeatherImage(weather.description);
            
            // <<-- Display UI (Bootstrap + custom CSS) -->>
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
            
            const lastUpdated = new Date().toLocaleString();
            
            // Store weather data for export
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
                forecast: []
            };
            dataSource = 'api';
            
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
        })
        .catch(error => {
            output.innerHTML = `
                <div class="alert alert-danger">
                    Error: ${error.message}
                </div>
            `;
        });
}
function register() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const verifyPassword = document.getElementById('regVerifyPassword').value.trim();
    const registerOutput = document.getElementById('registerOutput');

    // <<-- Validation -->> 
    if (name === "" || email === "" || password === "" || verifyPassword === "") {
        registerOutput.innerHTML = `
            <div class="alert alert-warning">
                Please fill in all fields
            </div>
        `;
        return;
    }

    if (password !== verifyPassword) {
        registerOutput.innerHTML = `
            <div class="alert alert-warning">
                Passwords do not match
            </div>
        `;
        return;
    }

    if (password.length < 6) {
        registerOutput.innerHTML = `
            <div class="alert alert-warning">
                Password must be at least 6 characters long
            </div>
        `;
        return;
    }

    // <<-- Check if user already exists -->> 
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(user => user.email === email)) {
        registerOutput.innerHTML = `
            <div class="alert alert-danger">
                Email already registered
            </div>
        `;
        return;
    }

    // <<-- Register user -->> 
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

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginOutput = document.getElementById('loginOutput');

    // <<-- Simple validation -->> 
    if (username === "" || password === "") {
        loginOutput.innerHTML = `
            <div class="alert alert-warning">
                Please enter username and password
            </div>
        `;
        return;
    }

    // <<-- Check registered users or default admin -->> 
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    let user = users.find(u => u.email === username || u.name === username);
    
    if ((user && user.password === password) || (username === "admin" && password === "1234")) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('currentUser', username);
        document.getElementById('loginView').classList.add('d-none');
        document.getElementById('appView').classList.remove('d-none');
        // Clear login form
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

function switchToRegister() {
    document.getElementById('loginView').classList.add('d-none');
    document.getElementById('registerView').classList.remove('d-none');
    document.getElementById('registerOutput').innerHTML = '';
    // <-- Clear register form -->>
    document.getElementById('regName').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regVerifyPassword').value = '';
}

function switchToLogin() {
    document.getElementById('registerView').classList.add('d-none');
    document.getElementById('loginView').classList.remove('d-none');
    document.getElementById('loginOutput').innerHTML = '';
    // Clear login form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}
function logout() {
    localStorage.removeItem('loggedIn');
    document.getElementById('appView').classList.add('d-none');
    document.getElementById('loginView').classList.remove('d-none');
}

window.onload = function() {
    if (localStorage.getItem('loggedIn') === 'true') {
        document.getElementById('loginView').classList.add('d-none');
        document.getElementById('appView').classList.remove('d-none');
    }
};

// Export weather data to JSON file
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

// Import weather data from JSON file
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

// Display imported weather data
function displayImportedWeather(data) {
    const output = document.getElementById('output');
    const current = data.current;
    const alerts = data.alerts || [];
    
    // Get weather image for the condition
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