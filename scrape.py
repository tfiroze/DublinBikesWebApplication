from datetime import datetime
def availability(data):
    
    for i in range(0,len(data)):
        now = datetime.now()
        now.strftime('%Y-%m-%d %H:%M:%S')
        p="https://api.open-meteo.com/v1/forecast?latitude=53.30&longitude=-6.22&daily=precipitation_sum,rain_sum,precipitation_probability_max&current_weather=true&timezone=Europe%2FLondon"
        r = requests.get(p)
        res = json.loads(r.text)
        insert1=f"INSERT INTO weather (number,time,temperature,wind_speed,wind_direction,weather_code,precipitation_sum ,rain_sum ,precipitation_probability ) Values(%s,%s,%s,%s,%s,%s,%s,%s,%s)"
        values1=(
                data[i]['number'],
                now,
                res['current_weather']['temperature'],
                res['current_weather']['windspeed'],
                res['current_weather']['winddirection'],
                res['current_weather']['weathercode'],
                res['daily']['precipitation_sum'][0],
                res['daily']['rain_sum'][0],
                res['daily']['precipitation_probability_max'][0]
        )

        insert2=f"INSERT INTO availability (number,last_update,available_bikes,available_bike_stands,status,time) Values(%s,%s,%s,%s,%s,%s)"
        values2=(
                data[i]['number'],
                data[i]['last_update'],
                data[i]['available_bikes'],
                data[i]['available_bike_stands'],
                data[i]['status'],
                now)
        
        mycursor.execute(insert1, values1)
        engine.commit()
        mycursor.execute(insert2, values2)

    
import mysql.connector
import time
import traceback
engine = mysql.connector.connect(host="softwaredb.ce0otalnccc9.eu-west-1.rds.amazonaws.com",user="soft",password="password",database="dublinbikes")
mycursor = engine.cursor()


import requests
import json
NAME="Dublin" # name of contract
STATIONS="https://api.jcdecaux.com/vls/v1/stations?"
APIKEY = "772474ead9d6527be32fcb2c7b1d631d990fa561"
def main():
    try:
        r = requests.get(STATIONS,params={"apiKey": APIKEY, "contract": NAME})
        data=json.loads(r.text)
        availability(data)
        time.sleep(5*60)
    except:
        print(traceback.format_exc())
        return
main()
