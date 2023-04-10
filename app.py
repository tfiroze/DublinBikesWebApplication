from flask import Flask, jsonify
import pymysql.cursors
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Configure database connection
conn = pymysql.connect(
    host="softwaredb.ce0otalnccc9.eu-west-1.rds.amazonaws.com",user="soft",password="password",database="dublinbikes",
    charset="utf8mb4",
    cursorclass=pymysql.cursors.DictCursor
)

# Define Flask route to get station data
@app.route('/stations')
def get_stations():
    # Query the database to retrieve station data
    with conn.cursor() as cursor:
        sql = "SELECT * FROM station"
        cursor.execute(sql)
        results = cursor.fetchall()

    # Return the data as a JSON object
    return jsonify(results)


# Define Flask route to get station data
@app.route('/history')
def get_history():
    # Query the database to retrieve station data
    with conn.cursor() as cursor:
        sql = "SELECT * FROM dublinbikes.availability WHERE time >= now() - interval 6 hour"
        cursor.execute(sql)
        results = cursor.fetchall()

    # Return the data as a JSON object
    return jsonify(results)



if __name__ == '__main__':
    app.run(debug=True)
