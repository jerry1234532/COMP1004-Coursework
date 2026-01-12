const apiKey = 'd33240b0e6f1240bb1be4def48a3a041'

function getWeather() { 
    const city = document.getElementById('cityInput').value;
    const output = document.getElementById('output');

    if (city === "") { 
        output.innerHTML = "Please enter a city name.";
        return;
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('City not found');
        }
        return response.json();
    }) 
    .then(data => {
        const temperature = data.main.temp;
        const description = data.weather[0].description;
        const windSpeed = data.wind.speed;

        output.innerHTML = `
        <p><strong>City:</strong> ${data.name}</p>
        <p><strong>Temperature:</strong> ${temperature} °C</p>
        <p><strong>Weather:</strong> ${description}</p>
        <p><strong>Wind Speed:</strong> ${windSpeed} m/s</p>
        `;
    }) 
    .catch(error => {
        output.innerHTML = "Error: Unable to retrieve weather data. " + error.message;
    });
}