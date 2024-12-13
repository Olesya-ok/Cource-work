document.addEventListener("DOMContentLoaded", function () {

    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        return new Intl.DateTimeFormat('uk-UA', options).format(date);
    }

    const currentDate = new Date();
    const dateTimeElement = document.querySelector('.date-time');

    if (dateTimeElement) {
        dateTimeElement.textContent = formatDate(currentDate);
    } else {
        console.error('Елемент .date-time не знайдено!');
    }

    const modalOverlay = document.getElementById('modalOverlay');
    const closeButton = document.getElementById('closeButton');
    const weatherDiv = document.querySelector('.weather');
    const weatherDaysButton = document.querySelector('.weather-days');

    weatherDaysButton.addEventListener('click', async () => {
        const city = document.querySelector('#weather-input').value.trim() || 'Kyiv';
        await getData(city, true); // показуємо прогноз у модальному вікні
        modalOverlay.classList.add('show');
        weatherDiv.classList.add('weather-hidden');
    });

    closeButton.addEventListener('click', () => {
        modalOverlay.classList.remove('show');
        weatherDiv.classList.add('weather-hidden');
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('show');
        }
    });

    document.querySelector('#weatherAll').addEventListener('submit', e => {
        e.preventDefault();
        const input = document.querySelector('#weather-input');
        getData(input.value.trim());
    });

    getData('Nikopol\'');
});

// Отримання даних про погоду
async function getData(city, isModal = false) {
    const apyKey = `6191fbc0dc22e013350afb9e3a2425d0`
    const baseURL = `api.openweathermap.org/data/2.5/forecast`
    try {
        const res = await fetch(`https://${baseURL}?q=${city}&appid=${apyKey}&units=metric`);

        if (!res.ok) {
            const data = await res.json();
            alert(data.message);
        } else {
            const data = await res.json();
            console.log('Дані отримано:', data);

            if (isModal) {
                createForecast(data);
                createHourWeather(data);
            } else {
                createWeather(data);
                createHourWeather(data);
            }
        }
    } catch (error) {
        alert('Помилка при завантаженні даних: ' + error.message);
    }
}


const weatherIcons = {
    '01d': 'images/weather-icon/clear-sky.png',
    '01n': 'images/weather-icon/clear-sky-night.png',
    '02d': 'images/weather-icon/few-clouds.png',
    '03d': 'images/weather-icon/scattered-clouds.png',
    '03n': 'images/weather-icon/scattered-clouds.png',
    '04d': 'images/weather-icon/scattered-clouds.png',
    '04n': 'images/weather-icon/scattered-clouds.png',
    '09d': 'images/weather-icon/shower-rain.png',
    '09n': 'images/weather-icon/shower-rain.png',
    '10d': 'images/weather-icon/rain.png',
    '10n': 'images/weather-icon/rain.png',
    '11d': 'images/weather-icon/thunderstorm.png',
    '11n': 'images/weather-icon/thunderstorm.png',
    '13d': 'images/weather-icon/snow.png',
    '13n': 'images/weather-icon/snow.png',
};

function createWeather(data) {
    const cityName = data.city.name;
    const weatherContainer = document.querySelector('.weather');

    if (weatherContainer) {
        weatherContainer.innerHTML = '';

        const cityHeader = document.createElement('h3');
        cityHeader.textContent = `Прогноз погоди для ${cityName}`;
        weatherContainer.appendChild(cityHeader);

        const currentWeather = data.list[0];
        const temp = Math.round(currentWeather.main.temp);
        const weatherCode = currentWeather.weather[0].icon;
        const weatherDescription = currentWeather.weather[0].description;
        const weatherIcon = weatherIcons[weatherCode] || `https://openweathermap.org/img/wn/${weatherCode}.png`;

        const cityNameElement = document.querySelector('.cityName');
        if (cityNameElement) {
            cityNameElement.innerHTML = `  
                <img src="${weatherIcon}" alt="${weatherDescription}" class="weather-icon">
                <p>${cityName}</p>
            `;
        }

        const tempElement = document.querySelector('.temp .temperature');
        if (tempElement) {
            tempElement.innerHTML = `
                <p class="temp_min">Мін. температура: ${Math.round(currentWeather.main.temp_min)}℃</p>
                <p class="temp_max">Макс. температура: ${Math.round(currentWeather.main.temp_max)}℃</p>
            `;
        }

        const humidityElement = document.querySelector('.humidity');
        if (humidityElement) {
            humidityElement.innerHTML = `
                <img src="images/weather-icon/free-icon-humidity-2828802.png" alt="humidity">
                <p class="humidityP">Вологість: ${currentWeather.main.humidity}%</p>
            `;
        }

        const windSpeedElement = document.querySelector('.windSpeed');
        if (windSpeedElement) {
            windSpeedElement.innerHTML = `
                <img src="images/weather-icon/weather_16279006.png" alt="wind">
                <p class="windSpeedP">Вітер: ${Math.round(currentWeather.wind.speed)} м/с</p>
            `;
        }

        const sunriseTimestamp = data.city.sunrise;
        const sunsetTimestamp = data.city.sunset;

        const sunriseTime = formatTime(sunriseTimestamp);
        const sunsetTime = formatTime(sunsetTimestamp);

        const compassElement = document.querySelector('.compass');
        if (compassElement) {
            compassElement.innerHTML = `
                <img src="images/weather-icon/free-icon-sunrise-5370627.png" alt="sunrise">
                <p class="sunriseTime">Схід сонця: ${sunriseTime}</p>
                <img src="images/weather-icon/free-icon-sunset-2443647.png" alt="sunset">
                <p class="sunsetTime">Захід сонця: ${sunsetTime}</p>
            `;
        }
    } else {
        console.error('Елемент .weather не знайдено!');
    }
}

function createForecast(data) {
    const modalContent = document.querySelector('.modal-content');
    const forecastContainer = modalContent ? modalContent.querySelector('.forecast-container') : null;

    if (!modalContent || !forecastContainer) {
        console.error('Помилка: елементи для прогнозу не знайдені.');
        return;
    }

    forecastContainer.innerHTML = '';

    const dailyForecasts = [];
    const seenDates = new Set();

    data.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const formattedDate = date.toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' });

        if (!seenDates.has(formattedDate)) {
            seenDates.add(formattedDate);

            const temp = Math.round(item.main.temp);
            const weatherCode = item.weather[0].icon;
            const weatherDescription = item.weather[0].description;
            const weatherIcon = weatherIcons[weatherCode] || `https://openweathermap.org/img/wn/${weatherCode}.png`;

            dailyForecasts.push({
                date: formattedDate,
                temp: temp,
                weatherIcon: weatherIcon,
                weatherDescription: weatherDescription,
            });
        }
    });

    if (dailyForecasts.length === 0) {
        console.error('Прогнози не знайдені.');
        return;
    }

    const title = document.createElement('h3');
    title.textContent = 'Погода на 5 днів';
    forecastContainer.appendChild(title);

    dailyForecasts.slice(0, 5).forEach((forecast) => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('forecast-day');

        dayElement.innerHTML = `
            <p class="date">${forecast.date}</p>
            <img src="${forecast.weatherIcon}" alt="${forecast.weatherDescription}" class="weather-icon">
            <p class="temp">Температура: ${forecast.temp}℃</p>
        `;

        forecastContainer.appendChild(dayElement);
    });
}

function createHourWeather(data) {
    const hourlyWeather = document.querySelector('.hourly-weather');

    if (!hourlyWeather) {
        console.error('Помилка: елемент .hourly-weather не знайдено.');
        return;
    }

    hourlyWeather.innerHTML = '';

    const hourlyData = data.list;

    console.log('Дані для погод на годину:', hourlyData);

    if (!Array.isArray(hourlyData) || hourlyData.length === 0) {
        console.error('Помилка: дані для погод на годину відсутні.');
        hourlyWeather.innerHTML = '<p>Немає доступних даних для відображення.</p>';
        return;
    }

    let count = 0;
    hourlyData.forEach((hourData, index) => {
        if (index % 3 === 0 && count < 4) {
            if (hourData && hourData.main && hourData.weather) {
                const time = new Date(hourData.dt * 1000);
                const hours = time.getHours();
                const minutes = time.getMinutes();
                const formattedTime = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;

                const day = time.getDate();
                const month = time.getMonth() + 1;
                const formattedDate = `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}`;

                const temp = Math.round(hourData.main.temp);
                const weatherCode = hourData.weather[0].icon;
                const weatherIcon = `https://openweathermap.org/img/wn/${weatherCode}.png`;
                const weatherDescription = hourData.weather[0].description;

                // Логування для перевірки часу
                console.log('Час:', formattedTime, 'Дата:', formattedDate);

                // Створюємо елемент для відображення погод на годину
                const hourElement = document.createElement('div');
                hourElement.classList.add('hour-weather');

                hourElement.innerHTML = `
                    <p class="time">${formattedTime}</p>
                    <p class="date">${formattedDate}</p>
                    <img src="${weatherIcon}" alt="${weatherDescription}" class="weather-icon">
                    <p class="temp">${temp}℃</p>
                `;

                hourlyWeather.appendChild(hourElement);
                count++;
            } else {
                console.error('Помилка: Нестача даних для погоди.');
            }
        }
    });
}

// Функція для форматування часу (схід та захід сонця)
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

