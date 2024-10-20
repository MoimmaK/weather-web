const apiKey = '75d0b61f83f5c9bb7c350ac2c2bbc288'; // Replace with your OpenWeatherMap API key
let currentPage = 1;
const rowsPerPage = 3;
const tableBody = document.querySelector("#forecast-table tbody");
let weatherData = [];  // Declare weatherData globally
let originalWeatherData = []; // To store unfiltered/unmodified data

// Function to fetch weather data from OpenWeatherMap API
async function fetchWeatherData(city) {
  const spinner = document.querySelector('.loading-spinner');
  const overlay = document.querySelector('.blur-overlay'); 
  const table = document.getElementById('forecast-table');
  const cityForecastMessage = document.getElementById("city-forecast-message"); // Reference to the city forecast message

  try {
      // Show loading spinner
      spinner.style.display = 'block';
      overlay.style.display = 'block'; // Show the overlay
      table.classList.add('loading');

      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
      const data = await response.json();
      
      if (data.cod === "200") {
          // Clear previous error message if data is valid
          document.getElementById("error-message").textContent = '';
          originalWeatherData = data.list.filter(item => item.dt_txt.includes("12:00:00")).map((item) => ({
              date: new Date(item.dt_txt).toLocaleDateString(),
              temp: item.main.temp,
              weather: item.weather[0].main,
              rain: item.rain ? 'Yes' : 'No'
          }));

          weatherData = [...originalWeatherData]; // Clone the data to preserve the original set
          currentPage = 1; // Reset pagination
          resetDropdowns(); // Reset dropdowns when new city is searched
          displayWeatherData(weatherData, currentPage); // Display the filtered data
          table.style.display = 'table'; // Ensure the table is visible for valid data

          // Set the city forecast message
          cityForecastMessage.textContent = `5-Day Weather Forecast of ${city.charAt(0).toUpperCase() + city.slice(1)}`; // Capitalize the first letter of city
      } else {
          handleError(data.message); // Display error message if the city is invalid
      }
  } catch (error) {
      handleError('Error fetching weather data'); // Handle network or API errors
  } finally {
      // Hide loading spinner
      spinner.style.display = 'none';
      overlay.style.display = 'none';
      table.classList.remove('loading');
      document.getElementById('city-input').value=''; // Clear city input after fetching
  }
}

  
// Function to display weather data in the table
function displayWeatherData(weatherData, page) {
  const tableBody = document.querySelector("#forecast-table tbody");
  tableBody.innerHTML = ""; // Clear the previous table content
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = weatherData.slice(start, end);

  paginatedData.forEach((data) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.date}</td>
      <td>${data.temp}</td>
      <td>${data.weather}</td>
      <td>${data.rain}</td>
    `;
    tableBody.appendChild(row);
  });

  document.getElementById("prev-page").disabled = currentPage === 1;
  document.getElementById("next-page").disabled = end >= weatherData.length;
  document.getElementById("current-page").textContent = currentPage;
}

// Handle fetching weather data on button click
document.getElementById("get-weather").addEventListener("click", function () {
  const city = document.getElementById("city-input").value.trim(); // Remove any leading/trailing spaces
  
  // Check for empty input
  if (city === "") {
    handleError("City name cannot be empty");
  } else {
    fetchWeatherData(city);
  }
});

// Error handling function
function handleError(message) {
  // Clear the table content if there's an error
  document.querySelector("#forecast-table tbody").innerHTML = "";
  document.getElementById('forecast-table').style.display = 'none'; // Hide table
  document.getElementById("error-message").textContent = message; // Show error message
  document.getElementById("error-message").style.color = "red"; // Optional: Set error message styling
}

// Default load: Fetch weather data for Seoul on page load
window.addEventListener('load', function () {
  fetchWeatherData('Seoul');
});


// Pagination controls
document.getElementById("prev-page").addEventListener("click", function () {
  if (currentPage > 1) {
    currentPage--;
    displayWeatherData(weatherData, currentPage);
  }
});

document.getElementById("next-page").addEventListener("click", function () {
  if ((currentPage * rowsPerPage) < weatherData.length) {
    currentPage++;
    displayWeatherData(weatherData, currentPage);
  }
});

// Handle fetching weather data on button click
document.getElementById("get-weather").addEventListener("click", function () {
  const city = document.getElementById("city-input").value;
  fetchWeatherData(city);
});

// Default load: Fetch weather data for Seoul on page load
window.addEventListener('load', function () {
  fetchWeatherData('Seoul');
});

// Sorting function
function handleSort() {
  const sortValue = document.getElementById("sort-dropdown").value;

  // Reset weatherData to original data if no sorting is selected
  weatherData = [...originalWeatherData];

  if (sortValue === "temp-asc") {
    weatherData.sort((a, b) => a.temp - b.temp);
  } else if (sortValue === "temp-desc") {
    weatherData.sort((a, b) => b.temp - a.temp);
  }

  currentPage = 1; // Reset to first page after sorting
  displayWeatherData(weatherData, currentPage);  // Refresh table after sorting
}

// Filtering function
function handleFilter() {
  const filterValue = document.getElementById("filter-dropdown").value;

  // Reset weatherData to original data if no filtering is selected
  weatherData = [...originalWeatherData];

  if (filterValue === "rainy") {
    weatherData = weatherData.filter(data => data.rain === 'Yes');
  } else if (filterValue === "max-temp") {
    const maxTemp = Math.max(...weatherData.map(data => data.temp));
    weatherData = weatherData.filter(data => data.temp === maxTemp);
  }

  currentPage = 1; // Reset to the first page
  displayWeatherData(weatherData, currentPage); // Refresh table after filtering
}

// Function to reset dropdowns when city changes or filter is removed
function resetDropdowns() {
  document.getElementById("sort-dropdown").value = "";
  document.getElementById("filter-dropdown").value = "";
}


