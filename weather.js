let initProject = function () {
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

    if (weatherDaysButton) {
        weatherDaysButton.addEventListener('click', async () => {
            const city = document.querySelector('#weather-input').value.trim() || 'Nikopol\'';
            await getData(city, true); // показуємо прогноз у модальному вікні
            modalOverlay.classList.add('show');
            weatherDiv.classList.add('weather-hidden');
        });
    } else {
        console.error('Елемент .weather-days не знайдено!');
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modalOverlay.classList.remove('show');
            weatherDiv.classList.add('weather-hidden');
        });
    } else {
        console.error('Кнопка закриття модального вікна не знайдена!');
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('show');
            }
        });
    } else {
        console.error('Модальне вікно не знайдено!');
    }

    const weatherForm = document.querySelector('#weatherAll');
    if (weatherForm) {
        weatherForm.addEventListener('submit', e => {
            e.preventDefault();
            const input = document.querySelector('#weather-input');
            getData(input.value.trim());
        });
    } else {
        console.error('Форма для пошуку погоди не знайдена!');
    }

    getData("Nikopol'");
};

document.addEventListener("DOMContentLoaded", initProject);


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

function getWeatherIcon(weatherCode) {
    switch (weatherCode) {
        case '01d':
            return 'images/weather-icon/clear-sky.png';
        case '01n':
            return 'images/weather-icon/clear-sky-night.png';
        case '02d':
            return 'images/weather-icon/few-clouds.png';
        case '02n':
            return 'images/weather-icon/few-clouds-night.png';
        case '03d':
        case '03n':
        case '04d':
        case '04n':
            return 'images/weather-icon/scattered-clouds.png';
        case '09d':
        case '09n':
            return 'images/weather-icon/shower-rain.png';
        case '10d':
            return 'images/weather-icon/rain.png';
        case '10n':
            return 'images/weather-icon/rain-night.png';
        case '11d':
        case '11n':
            return 'images/weather-icon/thunderstorm.png';
        case '13d':
        case '13n':
            return 'images/weather-icon/snow.png';
        case '50d':
        case '50n':
            return 'images/weather-icon/mist.png';
        default:
            console.warn(`Невідомий код погоди: ${weatherCode}`);
            return `https://openweathermap.org/img/wn/${weatherCode}.png`; // Значение по умолчанию
    }
}


function createWeather(data) {
    const cityName = data.city.name;
    const weatherContainer = document.querySelector('.weather');

    if (weatherContainer) {
        weatherContainer.innerHTML = '';

        // Заголовок города
        const cityHeader = document.createElement('h3');
        cityHeader.textContent = `Прогноз погоди для ${cityName}`;
        weatherContainer.appendChild(cityHeader);

        const currentWeather = data.list[0];
        const temp = Math.round(currentWeather.main.temp);
        const weatherCode = currentWeather.weather[0].icon;
        const weatherDescription = currentWeather.weather[0].description;
        const weatherIcon = getWeatherIcon(weatherCode);

        // Элемент с названием города и иконкой погоды
        const cityNameElement = document.querySelector('.cityName');
        if (cityNameElement) {
            cityNameElement.innerHTML = '';

            const imgElement = document.createElement('img');
            imgElement.src = weatherIcon;
            imgElement.alt = weatherDescription;
            imgElement.classList.add('weather-icon');

            const cityNameText = document.createElement('p');
            cityNameText.textContent = cityName;

            cityNameElement.appendChild(imgElement);
            cityNameElement.appendChild(cityNameText);
        }

        // Элемент с температурой
        const tempElement = document.querySelector('.temp .temperature');
        if (tempElement) {
            tempElement.innerHTML = '';

            const tempMin = document.createElement('p');
            tempMin.classList.add('temp_min');
            tempMin.textContent = `Мін. температура: ${Math.round(currentWeather.main.temp_min)}℃`;

            const tempMax = document.createElement('p');
            tempMax.classList.add('temp_max');
            tempMax.textContent = `Макс. температура: ${Math.round(currentWeather.main.temp_max)}℃`;

            tempElement.appendChild(tempMin);
            tempElement.appendChild(tempMax);
        }

        // Элемент с влажностью
        const humidityElement = document.querySelector('.humidity');
        if (humidityElement) {
            humidityElement.innerHTML = '';

            const imgElement = document.createElement('img');
            imgElement.src = 'images/weather-icon/free-icon-humidity-2828802.png';
            imgElement.alt = 'humidity';

            const humidityText = document.createElement('p');
            humidityText.classList.add('humidityP');
            humidityText.textContent = `Вологість: ${currentWeather.main.humidity}%`;

            humidityElement.appendChild(imgElement);
            humidityElement.appendChild(humidityText);
        }

        // Элемент со скоростью ветра
        const windSpeedElement = document.querySelector('.windSpeed');
        if (windSpeedElement) {
            windSpeedElement.innerHTML = '';

            const imgElement = document.createElement('img');
            imgElement.src = 'images/weather-icon/weather_16279006.png';
            imgElement.alt = 'wind';

            const windSpeedText = document.createElement('p');
            windSpeedText.classList.add('windSpeedP');
            windSpeedText.textContent = `Вітер: ${Math.round(currentWeather.wind.speed)} м/с`;

            windSpeedElement.appendChild(imgElement);
            windSpeedElement.appendChild(windSpeedText);
        }

        // Элементы восхода и заката
        const sunriseTimestamp = data.city.sunrise;
        const sunsetTimestamp = data.city.sunset;

        const sunriseTime = formatTime(sunriseTimestamp);
        const sunsetTime = formatTime(sunsetTimestamp);

        const compassElement = document.querySelector('.compass');
        if (compassElement) {
            compassElement.innerHTML = '';

            const sunriseImg = document.createElement('img');
            sunriseImg.src = 'images/weather-icon/free-icon-sunrise-5370627.png';
            sunriseImg.alt = 'sunrise';

            const sunriseText = document.createElement('p');
            sunriseText.classList.add('sunriseTime');
            sunriseText.textContent = `Схід сонця: ${sunriseTime}`;

            const sunsetImg = document.createElement('img');
            sunsetImg.src = 'images/weather-icon/free-icon-sunset-2443647.png';
            sunsetImg.alt = 'sunset';

            const sunsetText = document.createElement('p');
            sunsetText.classList.add('sunsetTime');
            sunsetText.textContent = `Захід сонця: ${sunsetTime}`;

            compassElement.appendChild(sunriseImg);
            compassElement.appendChild(sunriseText);
            compassElement.appendChild(sunsetImg);
            compassElement.appendChild(sunsetText);
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
            const weatherIcon = getWeatherIcon(weatherCode);

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

    // Очищаем контейнер перед добавлением новых данных
    hourlyWeather.innerHTML = '';

    const hourlyData = data.list;

    if (!Array.isArray(hourlyData) || hourlyData.length === 0) {
        console.error('Помилка: дані для погод на годину відсутні.');

        const noDataElement = document.createElement('p');
        noDataElement.textContent = 'Немає доступних даних для відображення.';
        hourlyWeather.appendChild(noDataElement);

        return;
    }

    let count = 0; // Лимит количества прогнозов

    hourlyData.forEach((hourData, index) => {
        // Добавляем данные с шагом в 3 часа и ограничиваем до 4 записей
        if (index % 3 === 0 && count < 4) {
            if (hourData && hourData.main && hourData.weather) {
                // Временная метка и форматирование времени
                const time = new Date(hourData.dt * 1000);
                const hours = time.getHours();
                const minutes = time.getMinutes();
                const formattedTime = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;

                const day = time.getDate();
                const month = time.getMonth() + 1;
                const formattedDate = `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}`;

                // Температура и описание погоды
                const temp = Math.round(hourData.main.temp);
                const weatherCode = hourData.weather[0].icon;
                const weatherIcon = `https://openweathermap.org/img/wn/${weatherCode}.png`;
                const weatherDescription = hourData.weather[0].description;

                // Создаём контейнер для прогноза
                const hourElement = document.createElement('div');
                hourElement.classList.add('hour-weather');

                // Элемент времени
                const timeElement = document.createElement('p');
                timeElement.classList.add('time');
                timeElement.textContent = formattedTime;
                hourElement.appendChild(timeElement);

                // Элемент даты
                const dateElement = document.createElement('p');
                dateElement.classList.add('date');
                dateElement.textContent = formattedDate;
                hourElement.appendChild(dateElement);

                // Иконка погоды
                const iconElement = document.createElement('img');
                iconElement.src = weatherIcon;
                iconElement.alt = weatherDescription;
                iconElement.classList.add('weather-icon');
                hourElement.appendChild(iconElement);

                // Элемент температуры
                const tempElement = document.createElement('p');
                tempElement.classList.add('temp');
                tempElement.textContent = `${temp}℃`;
                hourElement.appendChild(tempElement);

                // Добавляем готовый элемент в контейнер
                hourlyWeather.appendChild(hourElement);

                count++; // Увеличиваем счётчик
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

