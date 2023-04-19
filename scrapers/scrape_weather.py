import requests
import json
def weather():
    p="https://api.open-meteo.com/v1/forecast?latitude=53.30&longitude=-6.22&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,precipitation_probability_max&current_weather=true&forecast_days=16&timezone=Europe%2FLondon"
    r = requests.get(p)
    X=json.loads(r.text)
    return X

