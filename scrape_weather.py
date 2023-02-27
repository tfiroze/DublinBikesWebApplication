import requests
import json
p="https://api.open-meteo.com/v1/forecast?latitude=53.33&longitude=-6.25&current_weather=true&timezone=Europe%2FLondon"
r = requests.get(p)
print(json.loads(r.text))

