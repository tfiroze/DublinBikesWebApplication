from flask import Flask, jsonify, request, render_template
import pymysql.cursors
from flask_cors import CORS
import json
import pickle
from scrapers import scrape_weather
from datetime import datetime

global station_data
app = Flask (__name__)
CORS(app)
# Configure database connection
conn = pymysql.connect(
    host="softwaredb.ce0otalnccc9.eu-west-1.rds.amazonaws.com",
    user="soft",
    password="password",
    database="dublinbikes",
    charset="utf8mb4",
    cursorclass=pymysql.cursors.DictCursor
)
conn2 = pymysql.connect(
    host="softwaredb.ce0otalnccc9.eu-west-1.rds.amazonaws.com",user="soft",password="password",database="dublinbikes",
    charset="utf8mb4",
    cursorclass=pymysql.cursors.DictCursor
)


# Define Flask route to get station data
station_data = None

@app.route('/stations')
def get_stations():
    
    # Query the database to retrieve station data
    with conn.cursor() as cursor:
        sql = "SELECT * FROM station"
        cursor.execute(sql)
        results = cursor.fetchall()

    

    # Return the data as a JSON object
    return jsonify(results)


# Define Flask route to get availability data
@app.route('/availability')
def get_availability():
    # Query the database to retrieve the latest availability data for each station
    with conn.cursor() as cursor:
        sql = """
            SELECT A.*
            FROM availability A
            INNER JOIN (
                SELECT number, MAX(time) as max_time
                FROM availability
                GROUP BY number
            ) B
            ON A.number = B.number AND A.time = B.max_time
        """
        cursor.execute(sql)
        results = cursor.fetchall()

    # Return the data as a JSON object
    return jsonify(results)

def get_station_function():
    global station_data
    # Query the database to retrieve station data
    with conn.cursor() as cursor:
        sql = "SELECT * FROM station"
        cursor.execute(sql)
        results = cursor.fetchall()

    station_data = results
get_station_function()



# Load the pickle models for available bikes and bike stands
def load_models():
    global station_data
    model_arr = {}
    model_dep = {}

    for station in station_data:
        station_number = station["number"]
        with open(f"models/model_arr/model_arr{station_number}.pkl", "rb") as f:
            model_arr[station_number] = pickle.load(f)
        with open(f"models/model_dep/model_dep{station_number}.pkl", "rb") as f:
            model_dep[station_number] = pickle.load(f)

    return model_arr, model_dep

def get_weather_data(date):
    data=scrape_weather.weather()
    daily_data = data['daily']
    if date in daily_data['time']:
        index = daily_data['time'].index(date)
    else:
        index = 0
    print(daily_data)
    precipitation_sum = daily_data['precipitation_sum'][index]
    rain_sum = daily_data['rain_sum'][index]
    precipitation_probability_max = daily_data['precipitation_probability_max'][index]
    maxtemp = daily_data['temperature_2m_max'][index]
    mintemp = daily_data['temperature_2m_min'][index]
    windspeed = data['current_weather']['windspeed']
    winddir = data['current_weather']['winddirection']
    temp = int(maxtemp+mintemp/2)
    weathercode = daily_data['weathercode'][index]
    return temp,precipitation_sum, rain_sum, precipitation_probability_max,weathercode,windspeed,winddir

model_arr, model_dep = load_models()
@app.route("/predict_available_bikes/<int:station_number>", methods=["POST"])
def predict_bikes(station_number):
    
    features = [request.json[k] for k in ["hour", "day", "minute", "month"]]
    date = request.json["date"]
    temp, precipitation_sum, rain_sum, precipitation_probability_max, weathercode,windspeed,windir = get_weather_data(date)
    features.extend([temp, windspeed,windir,weathercode,precipitation_sum, rain_sum, precipitation_probability_max])
    model = model_arr[station_number]
    print(features)
    prediction = round(model.predict([features])[0])
    return jsonify({"prediction": prediction})

@app.route("/predict_available_bike_stands/<int:station_number>", methods=["POST"])
def predict_bike_stands(station_number):
    features = [request.json[k] for k in ["hour", "day", "minute", "month"]]
    date = request.json["date"]
    temp, precipitation_sum, rain_sum, precipitation_probability_max, weathercode,windspeed,windir = get_weather_data(date)
    features.extend([temp, windspeed,windir,weathercode,precipitation_sum, rain_sum, precipitation_probability_max])
    model = model_dep[station_number]
    prediction = round(model.predict([features])[0])
    return jsonify({"prediction": prediction})

def decode_weather_code(weathercode):
    weather_code_map = {
        0: "Clear Sky",
        1: "Partly Cloudy",
        2: "Cloudy",
        3: "Overcast",
        4: "Fog",
        5: "Haze",
        6: "Smoke",
        7: "Dust or Sand, in suspension, visibility reduced",
        8: "Widespread Dust or Sand, visibility reduced",
        9: "Blowing Dust or Sand, visibility reduced",
        10: "Mist",
        11: "Patches of Shallow Fog",
        12: "Light Drizzle",
        13: "Drizzle",
        14: "Heavy Drizzle",
        15: "Light Rain",
        16: "Rain",
        17: "Heavy Rain",
        18: "Light Freezing Rain",
        19: "Freezing Rain",
        20: "Heavy Freezing Rain",
        21: "Light Rain Shower",
        22: "Rain Shower",
        23: "Heavy Rain Shower",
        24: "Light Snow",
        25: "Snow",
        26: "Heavy Snow",
        27: "Light Snow Shower",
        28: "Snow Shower",
        29: "Heavy Snow Shower",
        30: "Light Rain and Snow",
        31: "Rain and Snow",
        32: "Heavy Rain and Snow",
        33: "Thunderstorm",
        34: "Heavy Thunderstorm",
        35: "Thunderstorm with Hail",
        36: "Heavy Thunderstorm with Hail",
        37: "Squalls",
        38: "Funnel Cloud(s), Tornado or Waterspout",
        39: "Tropical Storm",
        40: "Hurricane or Typhoon",
        45: "Fog",
        48: "Rime Fog",
        51: "Light Drizzle",
        53: "Moderate Drizzle",
        55: "Dense Drizzle",
        56: "Light Freezing Drizzle",
        57: "Dense Drizzle",
        61: "Slight Rain",
        63: "Moderate Rain",
        65: "Heavy Rain",
        66: "Light Freezing Rain",
        67: "Heavy Freezing Rain",
        71: "Slight Snow Fall",
        73: "Moderate Snow Fall",
        75: "Heavy Snow Fall",
        77: "Snow Grains",
        80: "Slight Rain Showers",
        81: "Moderate Rain Showers",
        82: "Violent Rain Showers",
        85: "Slight Snow Showers",
        86: "Heavy Snow Showers",
        95: "Thunderstorm",
        96: "Thunderstorm with Slight Hail",
        99: "Thunderstorm with Heavy Hail"
    }

    return weather_code_map.get(weathercode, "Sunny")


@app.route("/current_weather")
def get_current_weather():
    date = datetime.now  # Replace this with the current date or the date you want to get the weather for
    temp, precipitation_sum, rain_sum, precipitation_probability_max, weathercode, windspeed, winddir = get_weather_data(date)
    decoded_weather_code = decode_weather_code(weathercode)
    return jsonify({"temperature": temp, "weather_description": decoded_weather_code, "weather_code": weathercode})


# # Define Flask route to get station data
# @app.route('/history')
# def get_history():
#     # Query the database to retrieve station data
#     with conn2.cursor() as cursor:
#         sql = "SELECT * FROM dublinbikes.availability WHERE time >= now() - interval 6 hour"
#         cursor.execute(sql)
#         results = cursor.fetchall()

#     # Return the data as a JSON object
#     return jsonify(results)

@app.route('/history')
def get_history():
    with conn2.cursor() as cursor:
        sql = "SELECT * FROM dublinbikes.availability WHERE time >= now() - interval 6 hour ORDER BY number"
        cursor.execute(sql)
        results = cursor.fetchall()
        stations={}
        for r in results:
            number=r["number"]
            if number in stations:
                stations[number].append(r)
            else:
                stations[number] = [r]
    return jsonify(stations)

@app.route('/')
def parent():
    return render_template('homepage.html')

if __name__ == '__main__':
    app.run(debug=True)
