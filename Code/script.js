const apiKey = 'd33240b0e6f1240bb1be4def48a3a041';

function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    const output = document.getElementById('output');

    // 🟡 Empty input check
    if (city === "") {
        output.innerHTML = `
            <div class="alert alert-warning">
                Please enter a city name.
            </div>
        `;
        return;
    }

    // 🔄 Loading message
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
            // ✅ Extract data
            const temperature = data.main.temp;
            const description = data.weather[0].description;
            const windSpeed = data.wind.speed;
            const humidity = data.main.humidity;
            const cityName = data.name;

            // 🎨 Display UI (Bootstrap + custom CSS)
            output.innerHTML = `
                <h3 class="mb-3">${cityName}</h3>

                <div class="row">

                    <div class="col-6 mb-3">
                        <div class="card weather-box p-3 shadow-sm">
                            <h6>🌡 Temperature</h6>
                            <p>${temperature} °C</p>
                        </div>
                    </div>

                    <div class="col-6 mb-3">
                        <div class="card weather-box p-3 shadow-sm">
                            <h6>🌤 Weather</h6>
                            <p>${description}</p>
                        </div>
                    </div>

                    <div class="col-6 mb-3">
                        <div class="card weather-box p-3 shadow-sm">
                            <h6>💨 Wind Speed</h6>
                            <p>${windSpeed} m/s</p>
                        </div>
                    </div>

                    <div class="col-6 mb-3">
                        <div class="card weather-box p-3 shadow-sm">
                            <h6>💧 Humidity</h6>
                            <p>${humidity}%</p>
                        </div>
                    </div>

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