const openWeatherApiKey = '75d0b61f83f5c9bb7c350ac2c2bbc288';
            const geminiApiKey = 'AIzaSyBDFkLIwGdm6OfcRvT0z793MjZA7QtvwiU'; 
            let history = [];  // To maintain the conversation history

            async function handleWeatherStats(query, chatContainer) {
  if (!originalWeatherData || originalWeatherData.length === 0) {
    appendBotResponse("No weather data available for this city.", chatContainer);
    return;
  }

  // Extract temperature data from originalWeatherData
  const temperatures = originalWeatherData.map(data => data.temp);
  const highestTemp = Math.max(...temperatures);
  const lowestTemp = Math.min(...temperatures);
  const averageTemp = (temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length).toFixed(2);

  let response = "";

  // Check for combinations of requests
  const wantsHighest = query.includes("highest temperature");
  const wantsLowest = query.includes("lowest temperature");
  const wantsAverage = query.includes("average temperature");

  // Construct the response based on what's requested
  if (wantsHighest && wantsLowest && wantsAverage) {
    response = 
      `The highest temperature this week was ${highestTemp}°C, ` +
      `the lowest was ${lowestTemp}°C, and the average temperature was ${averageTemp}°C.`;
  } else if (wantsHighest && wantsLowest) {
    response = 
      `The highest temperature this week was ${highestTemp}°C and the lowest was ${lowestTemp}°C.`;
  } else if (wantsHighest && wantsAverage) {
    response = 
      `The highest temperature this week was ${highestTemp}°C and the average temperature was ${averageTemp}°C.`;
  } else if (wantsLowest && wantsAverage) {
    response = 
      `The lowest temperature this week was ${lowestTemp}°C and the average temperature was ${averageTemp}°C.`;
  } else if (wantsHighest) {
    response = `The highest temperature this week was ${highestTemp}°C.`;
  } else if (wantsLowest) {
    response = `The lowest temperature this week was ${lowestTemp}°C.`;
  } else if (wantsAverage) {
    response = `The average temperature this week is ${averageTemp}°C.`;
  }

  appendBotResponse(response, chatContainer); // Show in the colored box
}


  document.getElementById("send-message").addEventListener("click", async function () {
    const query = document.getElementById("chat-input").value.trim().toLowerCase();
    const chatContainer = document.getElementById("chatbot-answers");

    if (query === "") return;

    // Append the user's message to the right side
    chatContainer.innerHTML += `
      <div class="chat-message user-message">
      <p class="user-text">${query}</p>
      </div>
    `;
    chatContainer.scrollTop = chatContainer.scrollHeight;  // Scroll to bottom
    document.getElementById("chat-input").value = ""; 

    // Bot response processing
    setTimeout(async () => {
      let botResponse = "";

      if (query.includes("hello") || query.includes("hi ther")) {
        botResponse = "Hello! How are you doing today?";
      } else if (query.includes("how are you") || query.includes("hru")) {
        botResponse = "I'm just a bot, but thanks for asking! How can I assist you today?";
      } else if (query.includes("weather")) {
        const city = extractCityFromQuery(query);
        botResponse = "Fetching weather data for you...";
        appendBotResponse(botResponse, chatContainer); // Show fetching message
      
        // Now fetch actual weather data
        await fetchWeatherDataForChatbot(city, chatContainer);
        return; // Return to avoid adding another message below
      }
      else if (query.includes("highest temperature") || query.includes("lowest temperature") || query.includes("average temperature")) {
        await handleWeatherStats(query, chatContainer);
        return; // Exit early to avoid appending again
     }
      else {
        await fetchGeminiResponse(query, chatContainer);
      }

      // Append the bot's response if not handled above
      if (botResponse) {
        chatContainer.innerHTML += `
          <div class="chat-message ai-message">
            <p class="ai-text">${botResponse}</p>
          </div>
        `;
      }

      chatContainer.scrollTop = chatContainer.scrollHeight;  // Scroll to bottom
    }, 1000); // Simulate bot response delay
  });

async function fetchWeatherDataForChatbot(city, chatContainer) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherApiKey}&units=metric`);
    const data = await response.json();

    if (data.cod === 200) {
      const botResponse = `The weather in ${city} is ${data.weather[0].description} with a temperature of ${data.main.temp}°C.`;
      appendBotResponse(botResponse, chatContainer);
    } else {
      appendBotResponse('City not found. Please enter a valid city name.', chatContainer);
    }
  } catch (error) {
    appendBotResponse('Unable to fetch weather data at this time.', chatContainer);
  }
}

function appendBotResponse(response, chatContainer) {
  chatContainer.innerHTML += `
    <div class="chat-message ai-message">
      <p class="ai-text">${response}</p>
    </div>
  `;
  history.push({ role: "bot", text: response });
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

            async function fetchWeatherDataForChatbot(query, chatContainer) {
              try {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${openWeatherApiKey}&units=metric`);
                const data = await response.json();

                if (data.cod === 200) {
                  const botResponse = `The weather in ${query} is ${data.weather[0].description} with a temperature of ${data.main.temp}°C.`;
                  appendBotResponse(botResponse, chatContainer);
                } else {
                  appendBotResponse('City not found. Please enter a valid city name.', chatContainer);
                }
              } catch (error) {
                appendBotResponse('Unable to fetch weather data at this time.', chatContainer);
              }
            }

            async function fetchGeminiResponse(query, chatContainer) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: query }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error:', errorData);
      appendBotResponse('Error fetching the answer: ' + errorData.error.message, chatContainer);
      return;
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text; 
    appendBotResponse(generatedText, chatContainer);
  } catch (error) {
    console.error('Fetch error:', error);
    appendBotResponse('Unable to fetch the answer at this time.', chatContainer);
  }
}



            function extractCityFromQuery(query) {
              return query.replace(/.*weather in /i, "").trim();
            }
