from flask import Flask, jsonify, request
import pymysql.cursors
from flask_cors import CORS
import pickle

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
station_data = [station for station in station_data if station['number'] != 88]


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

model_arr, model_dep = load_models()
@app.route("/predict_available_bikes/<int:station_number>", methods=["POST"])
def predict_bikes(station_number):
    data = request.get_json()
    model = model_arr[station_number]
    features = [data["hour"], data["day"], data["minute"], data["month"], data["temperature"], data["wind_speed"], data["wind_direction"], data["weather_code"]]
    prediction = model.predict([features])[0]
    return jsonify({"prediction": prediction})

@app.route("/predict_available_bike_stands/<int:station_number>", methods=["POST"])
def predict_bike_stands(station_number):
    data = request.get_json()
    model = model_dep[station_number]
    features = [data["hour"], data["day"], data["minute"], data["month"], data["temperature"], data["wind_speed"], data["wind_direction"], data["weather_code"]]
    prediction = model.predict([features])[0]
    return jsonify({"prediction": prediction})


if __name__ == '__main__':
    app.run(debug=True)
