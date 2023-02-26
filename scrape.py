
import requests
import json
NAME="Dublin" # name of contract
STATIONS="https://api.jcdecaux.com/vls/v1/stations"
APIKEY = "772474ead9d6527be32fcb2c7b1d631d990fa561"
r = requests.get(STATIONS,params={"apiKey": APIKEY, "contract": NAME})
json.loads(r.text)