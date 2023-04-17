from flask import Flask, jsonify, request
import pymysql.cursors
from flask_cors import CORS
import pickle
from scrapers import scrape_weather

global station_data
app = Flask(__name__)
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

        with open(f"models\\model_arr\\model_arr{station_number}.pkl", "rb") as f:
            model_arr[station_number] = pickle.load(f)
        with open(f"models\\model_dep\\model_dep{station_number}.pkl", "rb") as f:
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



if __name__ == '__main__':
    app.run(debug=True)
