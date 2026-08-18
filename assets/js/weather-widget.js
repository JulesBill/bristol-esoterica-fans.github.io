(function () {
  "use strict";

  /* Cheddar Gorge coordinates */
  var LAT = 51.28;
  var LON = -2.76;

  var API =
    "https://api.open-meteo.com/v1/forecast?latitude=" + LAT +
    "&longitude=" + LON +
    "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max" +
    "&timezone=Europe%2FLondon&forecast_days=5";

  /* WMO weather-code to emoji + description */
  var WMO = {
    0:  ["\u2600\uFE0F",  "Clear sky"],
    1:  ["\uD83C\uDF24\uFE0F", "Mainly clear"],
    2:  ["\u26C5",  "Partly cloudy"],
    3:  ["\u2601\uFE0F",  "Overcast"],
    45: ["\uD83C\uDF2B\uFE0F", "Fog"],
    48: ["\uD83C\uDF2B\uFE0F", "Depositing rime fog"],
    51: ["\uD83C\uDF26\uFE0F", "Light drizzle"],
    53: ["\uD83C\uDF26\uFE0F", "Moderate drizzle"],
    55: ["\uD83C\uDF27\uFE0F", "Dense drizzle"],
    56: ["\uD83C\uDF27\uFE0F", "Light freezing drizzle"],
    57: ["\uD83C\uDF27\uFE0F", "Dense freezing drizzle"],
    61: ["\uD83C\uDF27\uFE0F", "Slight rain"],
    63: ["\uD83C\uDF27\uFE0F", "Moderate rain"],
    65: ["\uD83C\uDF27\uFE0F", "Heavy rain"],
    66: ["\uD83C\uDF27\uFE0F", "Light freezing rain"],
    67: ["\uD83C\uDF27\uFE0F", "Heavy freezing rain"],
    71: ["\uD83C\uDF28\uFE0F", "Slight snow"],
    73: ["\uD83C\uDF28\uFE0F", "Moderate snow"],
    75: ["\uD83C\uDF28\uFE0F", "Heavy snow"],
    77: ["\uD83C\uDF28\uFE0F", "Snow grains"],
    80: ["\uD83C\uDF26\uFE0F", "Slight showers"],
    81: ["\uD83C\uDF27\uFE0F", "Moderate showers"],
    82: ["\uD83C\uDF27\uFE0F", "Violent showers"],
    85: ["\uD83C\uDF28\uFE0F", "Slight snow showers"],
    86: ["\uD83C\uDF28\uFE0F", "Heavy snow showers"],
    95: ["\u26C8\uFE0F", "Thunderstorm"],
    96: ["\u26C8\uFE0F", "Thunderstorm with slight hail"],
    99: ["\u26C8\uFE0F", "Thunderstorm with heavy hail"]
  };

  function wmo(code) {
    return WMO[code] || ["\u2753", "Unknown"];
  }

  function dayLabel(dateStr, i) {
    if (i === 0) return "Today";
    if (i === 1) return "Tomorrow";
    var d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
  }

  function barColor(mm) {
    if (mm <= 0)  return "rgba(46,160,67,0.5)";
    if (mm < 1)   return "rgba(46,160,67,0.7)";
    if (mm < 5)   return "rgba(210,153,34,0.7)";
    if (mm < 15)  return "rgba(218,54,51,0.7)";
    return "rgba(180,30,30,0.85)";
  }

  function render(data) {
    var c   = data.current;
    var d   = data.daily;
    var cur = wmo(c.weather_code);

    var maxRain = 1;
    var k;
    for (k = 0; k < d.time.length; k++) {
      if (d.precipitation_sum[k] > maxRain) maxRain = d.precipitation_sum[k];
    }

    var totalRain48 = 0;
    var j;
    for (j = 0; j < Math.min(2, d.time.length); j++) {
      totalRain48 += d.precipitation_sum[j];
    }
    totalRain48 += c.precipitation;

    var verdictClass, verdictText;
    if (totalRain48 <= 0.5) {
      verdictClass = "wx-verdict-dry";
      verdictText  = "\u2600\uFE0F Forecast looks dry rock should be in good nick";
    } else if (totalRain48 <= 5) {
      verdictClass = "wx-verdict-damp";
      verdictText  = "\uD83C\uDF26\uFE0F Some rain about beware seepage";
    } else {
      verdictClass = "wx-verdict-wet";
      verdictText  = "\uD83C\uDF27\uFE0F Significant rain expect wet rock, give it time to dry";
    }

    var html = '<div class="wx">';

    html += '<div class="wx-now">';
    html += '  <div class="wx-now-icon">' + cur[0] + '</div>';
    html += '  <div class="wx-now-details">';
    html += '    <div class="wx-now-temp">' + Math.round(c.temperature_2m) + '\u00B0C</div>';
    html += '    <div class="wx-now-desc">' + cur[1] + '</div>';
    html += '    <div class="wx-now-stats">';
    html += '      <span>\uD83D\uDCA8 ' + Math.round(c.wind_speed_10m) + ' km/h</span>';
    html += '      <span>\uD83D\uDCA7 ' + c.relative_humidity_2m + '%</span>';
    html += '      <span>\uD83C\uDF27\uFE0F ' + c.precipitation + ' mm</span>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    html += '<div class="wx-heading">5-day rainfall outlook</div>';
    html += '<div class="wx-forecast">';
    var i, mm, pct, ico;
    for (i = 0; i < d.time.length; i++) {
      mm  = d.precipitation_sum[i];
      pct = maxRain > 0 ? Math.max((mm / maxRain) * 100, mm > 0 ? 4 : 0) : 0;
      ico = wmo(d.weather_code[i]);

      html += '<div class="wx-day">';
      html += '  <div class="wx-day-label">' + dayLabel(d.time[i], i) + '</div>';
      html += '  <div class="wx-day-icon">' + ico[0] + '</div>';
      html += '  <div class="wx-day-bar-wrap">';
      html += '    <div class="wx-day-bar" style="width:' + pct + '%;background:' + barColor(mm) + '"></div>';
      html += '  </div>';
      html += '  <div class="wx-day-rain">' + mm.toFixed(1) + ' mm</div>';
      html += '</div>';
    }
    html += '</div>';

    html += '<div class="wx-verdict ' + verdictClass + '">' + verdictText + '</div>';

    html += '<div class="wx-credit">Weather data from <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a></div>';

    html += '</div>';

    return html;
  }

  var widget = document.getElementById("weather-widget");
  if (!widget) return;

  widget.innerHTML = '<div class="wx"><div class="wx-loading">Loading weather for Cheddar Gorge\u2026</div></div>';

  fetch(API)
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      widget.innerHTML = render(data);
    })
    .catch(function () {
      widget.innerHTML =
        '<div class="wx"><div class="wx-error">Could not load weather data \u2014 ' +
        '<a href="https://www.metoffice.gov.uk/weather/forecast/gcrj1n0cz" target="_blank" rel="noopener">' +
        'check the Met Office instead</a>.</div></div>';
    });
})();
