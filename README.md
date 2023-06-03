# Dublin Bikes Prediction System 

This system is a Flask application that provides a REST API for interacting with data related to Dublin Bikes. It enables users to retrieve real-time and historical data about bike stations and availability. Additionally, it uses trained machine learning models to predict the availability of bikes and bike stands at each station.

## Note

Replace your googlemap api key in the html file and your aws rds credentials in the flask app.

## Features

* Retrieve real-time data about all Dublin Bikes stations
* Access historical data for a given station
* Predict bike and bike stand availability at a specific time and date using machine learning
* Current and forecasted weather data

## Installation

To run this application locally, you need Python 3 and the ability to install libraries using pip.

1. Clone this repository to your local machine.
2. Navigate to the cloned directory.
3. Install the necessary libraries by running `pip install -r requirements.txt`.
4. Run the application by running `python app.py`.
5. Visit `localhost:5000` in your browser to interact with the application.

## API Endpoints

Here are the primary API endpoints:

* `GET /stations`: Returns a list of all bike stations.
* `GET /availability`: Returns the latest availability data for all stations.
* `POST /predict_available_bikes/<station_number>`: Returns a prediction of the number of available bikes at the given station number.
* `POST /predict_available_bike_stands/<station_number>`: Returns a prediction of the number of available bike stands at the given station number.
* `GET /current_weather`: Returns the current weather conditions.
* `GET /history`: Returns historical availability data for the past six hours.

## Built With

* Python
* Flask
* PyMySQL
* scikit-learn

## License

This project is licensed under the MIT License.

