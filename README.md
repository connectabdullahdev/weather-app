<div align="center">

# Aura Ethereal

**A detailed, multilingual weather app that runs in the browser and on Android.**

[![Live demo](https://img.shields.io/badge/Live_demo-connectabdullahdev.github.io%2Fweather--app-0F3740?style=for-the-badge)](https://connectabdullahdev.github.io/weather-app/)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chartdotjs&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?logo=capacitor&logoColor=white)

<img src="docs/preview.jpg" alt="Aura Ethereal showing current weather for Karachi" width="340">

</div>

## What it does

Search any city, or let the app detect your location, and get far more than a temperature:

- **Current conditions:** humidity, wind and gusts, feels-like vs. real temperature, visibility, pressure, UV index, dew point and cloud cover
- **Forecasts:** hourly forecast, a 7-day forecast with a weekly trend chart, and a precipitation timeline
- **Air quality** with a plain-language rating
- **Live weather map** powered by Windy
- **Smart section:** a comfort index, a weather score, an outdoor planner with the best activities for the day, and what to carry
- **Sun and moon:** sunrise, sunset, daylight length and moon phase
- **Compare cities** side by side and browse world cities
- **Five languages:** English, Urdu, Spanish, Hindi and German
- °C / °F and km/h / mph toggles, day and night themes, share and bookmark, pull to refresh

## Tech stack

| Area | Tools |
| --- | --- |
| UI | HTML5, CSS3, vanilla JavaScript |
| Data | [WeatherAPI.com](https://www.weatherapi.com/) (current, forecast, air quality, astronomy) |
| Map | Windy embed |
| Charts and icons | Chart.js, Lucide |
| Mobile | Capacitor (Android build) |

## Run it locally

No build step is needed.

```bash
git clone https://github.com/connectabdullahdev/weather-app.git
cd weather-app
npx serve .        # or open index.html directly
```

The app calls WeatherAPI.com. To use your own key, replace the `KEY` value near the top of `script.js` with a free key from [weatherapi.com](https://www.weatherapi.com/).

## Project structure

```
weather-app/
├── index.html   # layout and all sections, with data-i18n labels
├── style.css    # themes, layout and animations
├── script.js    # API calls, rendering, charts, i18n and settings
└── docs/        # screenshots
```

---

<div align="center">

Built by **Muhammad Abdullah** · [LinkedIn](https://www.linkedin.com/in/connectabdullahdev) · [GitHub](https://github.com/connectabdullahdev)

</div>
