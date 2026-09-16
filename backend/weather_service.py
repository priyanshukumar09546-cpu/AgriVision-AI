import requests
from datetime import datetime

# WMO Weather interpretation codes (WW)
WMO_CODE_MAP = {
    0: {"condition": "sunny", "label": "Clear Sky"},
    1: {"condition": "sunny", "label": "Mainly Clear"},
    2: {"condition": "partly-cloudy", "label": "Partly Cloudy"},
    3: {"condition": "partly-cloudy", "label": "Overcast"},
    45: {"condition": "partly-cloudy", "label": "Foggy"},
    48: {"condition": "partly-cloudy", "label": "Depositing Rime Fog"},
    51: {"condition": "rainy", "label": "Light Drizzle"},
    53: {"condition": "rainy", "label": "Moderate Drizzle"},
    55: {"condition": "rainy", "label": "Dense Drizzle"},
    61: {"condition": "rainy", "label": "Slight Rain"},
    63: {"condition": "rainy", "label": "Moderate Rain"},
    65: {"condition": "rainy", "label": "Heavy Rain"},
    71: {"condition": "partly-cloudy", "label": "Slight Snow"},
    73: {"condition": "partly-cloudy", "label": "Moderate Snow"},
    75: {"condition": "partly-cloudy", "label": "Heavy Snow"},
    80: {"condition": "rainy", "label": "Rain Showers"},
    81: {"condition": "rainy", "label": "Moderate Showers"},
    82: {"condition": "rainy", "label": "Violent Showers"},
    95: {"condition": "rainy", "label": "Thunderstorm"},
    96: {"condition": "rainy", "label": "Thunderstorm with Hail"},
    99: {"condition": "rainy", "label": "Heavy Thunderstorm with Hail"}
}

def calculate_disease_risk(temp: float, humidity: float, precip_prob: float) -> str:
    """
    Real epidemiological disease risk calculation based on empirical agricultural criteria:
    - High fungal spore germination: RH > 80% & Temp 18-29°C
    - Moderate risk: RH > 65% or rain probability > 40%
    - Low risk: RH < 65% & dry
    """
    if humidity >= 80 and 18 <= temp <= 30:
        return "High"
    elif humidity >= 65 or precip_prob >= 40:
        return "Moderate"
    else:
        return "Low"

def get_real_weather(lat: float = 28.6139, lon: float = 77.2090, location_name: str = "Regional Farm"):
    """
    Queries real live meteorological data from Open-Meteo free API (No API key needed, real global stations).
    """
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
            "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
            "timezone": "auto"
        }
        resp = requests.get(url, params=params, timeout=5)
        if resp.status_code != 200:
            return {
                "success": False,
                "error": "Unable to fetch weather information right now."
            }

        data = resp.json()
        current = data.get("current", {})
        daily = data.get("daily", {})

        current_temp = current.get("temperature_2m", 25.0)
        current_humidity = current.get("relative_humidity_2m", 60.0)
        current_code = current.get("weather_code", 0)
        wind_speed = current.get("wind_speed_10m", 10.0)

        wmo_info = WMO_CODE_MAP.get(current_code, {"condition": "sunny", "label": "Clear"})
        
        forecast_days = []
        times = daily.get("time", [])
        max_temps = daily.get("temperature_2m_max", [])
        min_temps = daily.get("temperature_2m_min", [])
        codes = daily.get("weather_code", [])
        precip_probs = daily.get("precipitation_probability_max", [])

        for i in range(min(len(times), 7)):
            d_str = times[i]
            dt = datetime.strptime(d_str, "%Y-%m-%d")
            day_name = dt.strftime("%a")
            formatted_date = dt.strftime("%b %d")
            d_code = codes[i] if i < len(codes) else 0
            d_wmo = WMO_CODE_MAP.get(d_code, {"condition": "sunny", "label": "Clear"})
            d_max = max_temps[i] if i < len(max_temps) else current_temp
            d_precip = precip_probs[i] if i < len(precip_probs) else 0

            d_risk = calculate_disease_risk(d_max, current_humidity, d_precip)

            forecast_days.append({
                "day": day_name,
                "date": formatted_date,
                "temp": f"{round(d_max)}°C",
                "condition": d_wmo["condition"],
                "conditionLabel": d_wmo["label"],
                "risk": d_risk
            })

        overall_risk = calculate_disease_risk(current_temp, current_humidity, 0)

        return {
            "success": True,
            "location": location_name,
            "latitude": lat,
            "longitude": lon,
            "current": {
                "temperature": f"{round(current_temp)}°C",
                "tempValue": current_temp,
                "humidity": f"{round(current_humidity)}%",
                "humidityValue": current_humidity,
                "windSpeed": f"{round(wind_speed, 1)} km/h",
                "condition": wmo_info["condition"],
                "conditionLabel": wmo_info["label"],
                "diseaseRisk": overall_risk
            },
            "forecast": forecast_days
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Unable to fetch weather information right now: {str(e)}"
        }

if __name__ == "__main__":
    res = get_real_weather()
    print("Weather test result:", res["success"])
    if res["success"]:
        print("Current temp:", res["current"]["temperature"], "Risk:", res["current"]["diseaseRisk"])
