import requests
import json
p="https://api.open-meteo.com/v1/forecast?latitude=53.30&longitude=-6.22&daily=precipitation_sum,rain_sum,precipitation_probability_max&current_weather=true&timezone=Europe%2FLondon"
r = requests.get(p)
X=json.loads(r.text)
print(X)
