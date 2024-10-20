const apiKey = '75d0b61f83f5c9bb7c350ac2c2bbc288'; // Replace with your OpenWeather API key

// Set the default value for the city input to "Seoul"
document.getElementById('city-input').value = 'Seoul';


let geolocationPromptShown = false; // Flag to check if the prompt has been shown

// Call getWeather() automatically when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if geolocation is supported and prompt hasn't been shown
    if (navigator.geolocation && !geolocationPromptShown) {
        getWeatherByGeolocation();
        geolocationPromptShown = true; // Set flag to true after showing the prompt
    } else {
        getWeather(); // If not allowed or already prompted, call getWeather()
    }
});

// Function to fetch weather data based on geolocation
function getWeatherByGeolocation() {
    
    const spinner = document.querySelector('.loading-spinner');
    const overlay = document.querySelector('.blur-overlay');

    // Show loading spinner and blur overlay for the whole page
    spinner.style.display = 'block';
    overlay.style.display = 'block';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords; // Get coordinates
            fetchWeatherByCoords(latitude, longitude); // Fetch weather data using coordinates
            document.getElementById('city-input').value='';
        },
        (error) => {
            console.error(error);
            showError("Unable to retrieve your location. Please enter a city name."); // Show error if location retrieval fails
            spinner.style.display = 'none';
            overlay.style.display = 'none';
            getWeather(); // Allow user to enter a city name if geolocation fails
            document.getElementById('city-input').value='';
        }
    );
}

// Function to fetch weather data based on coordinates
function fetchWeatherByCoords(lat, lon) {
    const unit = document.querySelector('input[name="unit"]:checked').value; // Get selected unit (Celsius or Fahrenheit)

    const spinner = document.querySelector('.loading-spinner'); // Define spinner here
    const overlay = document.querySelector('.blur-overlay'); // Define overlay here

    // Show loading spinner and blur overlay
    spinner.style.display = 'block';
    overlay.style.display = 'block';

    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Unable to fetch data. Please try again later.");
            }
            return response.json();
        })
        .then(data => {
            currentTemperatureInCelsius = data.main.temp; // Store temperature in Celsius
            fetchedUnit = unit; // Store the unit in which the data was fetched
            displayWeather(data);
            getForecast(data.coord.lat, data.coord.lon); // Use coordinates for forecast

            // Update background GIF based on weather condition
            const weatherCondition = data.weather[0].main.toLowerCase(); // e.g., "clear", "rain"
            updateWeatherInfo(weatherCondition);
        })
        .catch(error => {
            showError(error.message);
            updateWeatherInfo('default');
        })
        .finally(() => {
            // Hide loading spinner and blur overlay
            spinner.style.display = 'none';
            overlay.style.display = 'none';
        });
}


let currentTemperatureInCelsius = null;
let fetchedUnit = 'metric'; // Default unit is metric (Celsius)


document.querySelectorAll('input[name="unit"]').forEach(radio => {
    radio.addEventListener('change', updateDisplayedTemperature); // Update temperature display when unit is toggled
});


document.getElementById('get-weather').addEventListener('click', getWeather);

const weatherGifs = {
    clear: 'clear.gif',
    rain: 'rain.gif',
    snow: 'snow.gif',
    clouds: 'cloud.gif',
    drizzle: 'drizzle.gif',
    thunderstorm: 'thunder.gif', 
    default: 'drizzle.gif',
    mist: 'mist.gif',
};


// Function to update the weather info
function updateWeatherInfo(weatherCondition) {
    const gifUrl = weatherGifs[weatherCondition] || weatherGifs.clear; // Default to clear if condition not found
    const weatherInfoDiv = document.getElementById('weather-info');
    
    // Create a div for the background GIF
    const bgGifDiv = document.createElement('div');
    bgGifDiv.className = 'bg-gif';
    bgGifDiv.style.backgroundImage = `url(${gifUrl})`;

    // Clear any existing background GIFs
    const existingBgGif = weatherInfoDiv.querySelector('.bg-gif');
    if (existingBgGif) {
        weatherInfoDiv.removeChild(existingBgGif);
    }

    // Append the new background GIF
    weatherInfoDiv.appendChild(bgGifDiv);
}




// Function to fetch weather data
function getWeather() {
    const city = document.getElementById('city-input').value.trim(); // Trim any extra spaces
    const unit = document.querySelector('input[name="unit"]:checked').value; // Get selected unit (Celsius or Fahrenheit)

    const spinner = document.querySelector('.loading-spinner');
    const overlay = document.querySelector('.blur-overlay'); 
    document.getElementById('city-input').value='';

    if (city) {
        // Show loading spinner and blur overlay
        spinner.style.display = 'block';
        overlay.style.display = 'block';

        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Invalid API key. Please check your API key.");
                    } else if (response.status === 404) {
                        throw new Error("City not found. Please enter a valid city.");
                    } else {
                        throw new Error("Unable to fetch data. Please try again later.");
                    }
                }
                return response.json();
            })
            .then(data => {
                currentTemperatureInCelsius = data.main.temp; // Store temperature in Celsius
                fetchedUnit = unit; // Store the unit in which the data was fetched
                displayWeather(data);
                getForecast(data.coord.lat, data.coord.lon); // Use coordinates for forecast

                // Update background GIF based on weather condition
                const weatherCondition = data.weather[0].main.toLowerCase(); // e.g., "clear", "rain"
                updateWeatherInfo(weatherCondition);
            })
            .catch(error => {
                showError(error.message);
                updateWeatherInfo('default');
            })
            .finally(() => {
                // Hide loading spinner and blur overlay
                spinner.style.display = 'none';
                overlay.style.display = 'none';
            });
    } else {
        showError("Please enter a city name.");
        updateWeatherInfo('default');
    }
}



// Function to update displayed temperature
function updateDisplayedTemperature() {
    // Get the selected unit
    const unit = document.querySelector('input[name="unit"]:checked').value;

    // Convert the temperature if necessary and update the display
    let temperature;
    if (fetchedUnit === 'metric') { // Fetched data is in Celsius
        if (unit === 'metric') { // User selected Celsius
            temperature = currentTemperatureInCelsius;
        } else if (unit === 'imperial') { // User selected Fahrenheit
            temperature = convertCelsiusToFahrenheit(currentTemperatureInCelsius);
        }
    } else if (fetchedUnit === 'imperial') { // Fetched data is in Fahrenheit
        if (unit === 'imperial') { // User selected Fahrenheit
            temperature = currentTemperatureInCelsius; // Do not convert
        } else if (unit === 'metric') { // User selected Celsius
            temperature = convertFahrenheitToCelsius(currentTemperatureInCelsius);
        }
    }

    // Update the temperature display
    document.querySelector('.temp').innerHTML = `Temperature: ${temperature.toFixed(1)} °${unit === 'metric' ? 'C' : 'F'}`;
}

// Function to convert Celsius to Fahrenheit
function convertCelsiusToFahrenheit(celsius) {
    return celsius * 9 / 5 + 32;
}

// Function to convert Fahrenheit to Celsius
function convertFahrenheitToCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5 / 9;
}


function displayWeather(data) {
    // Clear any existing error messages
    const errorElement = document.getElementById('weatherDetails');
    errorElement.innerHTML = ''; // Clear error message
    errorElement.style.color = ''; // Reset color
    document.getElementById('weather-info').style.display = 'block'; // Show weather section

    // Check for incomplete data and show error if necessary
    if (!data.main || !data.weather || !data.wind) {
        showError("Incomplete data received.");
        return; // Stop execution if data is incomplete
    }

    

    // Update the weather details with additional information
    document.querySelector('.city-name').innerHTML = `Weather in ${data.name}`;
    document.querySelector('.temp').innerHTML = `Temperature: ${data.main.temp.toFixed(1)} °${data.sys.country === "US" ? "F" : "C"}`; // Display temperature with unit
    document.querySelector('.humidity').innerHTML = `Humidity: ${data.main.humidity}%`;
    document.querySelector('.wind').innerHTML = `Wind Speed: ${data.wind.speed} m/s`;
    document.querySelector('.desc').innerHTML = `Condition: ${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}`; // Capitalize first letter
    document.querySelector('.weather-icon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`; // Update icon

    console.log(data);

    // Update temperature based on the selected unit
updateDisplayedTemperature();

}



function getForecast(lat, lon) {
    const spinner = document.querySelector('.loading-spinner');
    const overlay = document.querySelector('.blur-overlay'); 

    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Unable to fetch forecast data.");
            }
            return response.json();
        })
        .then(data => {
            const temps = [];
            const labels = [];
            const conditions = {};
            const dayCount = 5;

            // Loop through the forecast data and extract necessary details
            data.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const day = date.toLocaleDateString();
                
                // Collect temperatures for the next 5 days
                if (temps.length < dayCount) {
                    temps.push(item.main.temp);
                    labels.push(day);
                }

                // Count weather conditions
                const condition = item.weather[0].main;
                if (conditions[condition]) {
                    conditions[condition]++;
                } else {
                    conditions[condition] = 1;
                }
            });

            updateCharts(temps, labels, conditions);
           
        })
        .catch(error => {
            showError("Unable to fetch forecast data. Please try again later.");
           
        });
}

let barChart, doughnutChart, lineChart;

function updateCharts(temps, labels, conditions) {
    const ctxBar = document.getElementById('bar-chart').getContext('2d');
    const ctxDoughnut = document.getElementById('doughnut-chart').getContext('2d');
    const ctxLine = document.getElementById('line-chart').getContext('2d');
    document.querySelector('.container').style.display = 'block';
    document.querySelector('.forecast').style.display = 'block';
    document.querySelector('.sidebar').style.display = 'block';
    document.querySelector('.main-content').style.display = 'block';


     // Destroy existing charts before re-creating them
     if (barChart) barChart.destroy();
     if (doughnutChart) doughnutChart.destroy();
     if (lineChart) lineChart.destroy();
 
    // Vertical Bar Chart
barChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
        labels: labels.slice(0, 5),
        datasets: [{
            label: 'Temperature (°C)',
            data: temps.slice(0, 5),
            backgroundColor: 'rgba(25, 25, 112, 0.8)', // Midnight Blue
            borderColor: 'rgba(153, 102, 255, 1)', // Luminous border color
            borderWidth: 2,
            responsive: true, // Make the chart responsive
            maintainAspectRatio: false, // Allow the chart to resize freely
            hoverBackgroundColor: 'rgba(153, 102, 255, 0.9)', // Slightly brighter on hover
        }]
    },
    options: {
        animation: {
            delay: (context) => {
                if (context.type === 'data' && context.mode === 'default' && !context.chart._active.length) {
                    return context.index * 100; // Delay for each bar
                }
                return 0;
            },
            duration: 1000 // Animation duration
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)' // Subtle grid lines
                }
            }
        }
    }
});

// Doughnut Chart
doughnutChart = new Chart(ctxDoughnut, {
    type: 'doughnut',
    data: {
        labels: Object.keys(conditions),
        datasets: [{
            label: 'Weather Conditions',
            data: Object.values(conditions),
            backgroundColor: [
                'rgba(72, 61, 139, 0.8)', // Dark Slate Blue
                'rgba(48, 25, 52, 0.8)',  // Dark Purple
                'rgba(230, 230, 250, 0.8)', // Soft Lavender
                'rgba(75, 0, 130, 0.8)',   // Indigo
                'rgba(54, 162, 235, 0.6)'  // Keep or replace as needed
            ],
            responsive: true, // Make the chart responsive
            maintainAspectRatio: false, // Allow the chart to resize freely
            borderColor: 'rgba(153, 102, 255, 1)', // Luminous border color
            borderWidth: 2,
            hoverBackgroundColor: 'rgba(153, 102, 255, 0.9)', // Slightly brighter on hover
        }]
    },
    options: {
        animation: {
            delay: (context) => {
                if (context.type === 'data' && context.mode === 'default' && !context.chart._active.length) {
                    return context.index * 100; // Delay for each slice
                }
                return 0;
            },
            duration: 1000 // Animation duration
        }
    }
});

// Line Chart
lineChart = new Chart(ctxLine, {
    type: 'line',
    data: {
        labels: labels.slice(0, 5),
        datasets: [{
            label: 'Temperature (°C)',
            data: temps.slice(0, 5),
            backgroundColor: 'rgba(153, 102, 255, 0.4)', // Lighter for a soothing look
            borderColor: 'rgba(153, 102, 255, 1)', // Luminous border color
            fill: true, // Fill the area under the line for a glow effect
            responsive: true, // Make the chart responsive
            maintainAspectRatio: false, // Allow the chart to resize freely
            borderWidth: 2,
        }]
    },
    options: {
        animation: {
            // Use a "drop" animation effect
            onComplete: () => {
                const ctx = lineChart.ctx;
                ctx.font = 'bold 12px Arial';
                ctx.fillStyle = 'rgba(153, 102, 255, 1)';
                lineChart.data.datasets[0].data.forEach((value, index) => {
                    const meta = lineChart.getDatasetMeta(0).data[index];
                    ctx.fillText(value, meta.x, meta.y - 5);
                });
            },
            duration: 1500 // Animation duration
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)' // Subtle grid lines
                }
            }
        }
    }
});
}

function showError(message) {
    const errorElement = document.getElementById('weatherDetails');
    errorElement.innerHTML = `<p class="error">${message}</p>`;
    errorElement.style.color = 'red'; // Set color for error message
    document.getElementById('weather-info').style.display = 'none'; // Hide weather section on error

    // Optional: Add specific message for API key issues
    if (message.includes("Invalid API key")) {
        errorElement.innerHTML += "<p>Please check your API key in the configuration.</p>";
    }

    // Destroy existing charts if they exist
    if (barChart) {
        barChart.destroy();
        barChart = null; // Clear reference to the destroyed chart
    }
    if (doughnutChart) {
        doughnutChart.destroy();
        doughnutChart = null; // Clear reference to the destroyed chart
    }
    if (lineChart) {
        lineChart.destroy();
        lineChart = null; // Clear reference to the destroyed chart
    }

    highlightInputField(true);
}



function highlightInputField(error) {
    const cityInput = document.getElementById('city-input');
    if (error) {
        cityInput.style.borderColor = 'red'; // Highlight input in red for error
    } else {
        cityInput.style.borderColor = '#ddd'; // Reset to default color on valid input
    }
}

// Clear input highlight when user starts typing again
document.getElementById('city-input').addEventListener('input', () => highlightInputField(false));