
def availability(data):
    for i in range(0,len(data)):
        insert2=f"INSERT INTO availability (number,last_update,available_bikes,available_bike_stands,status) Values(%s,%s,%s,%s,%s)"
        values2=(
                data[i]['number'],
                data[i]['last_update'],
                data[i]['available_bikes'],
                data[i]['available_bike_stands'],
                data[i]['status'])
        #print(data[i]['last_update'])        
        # execute the query with the dictionary string as a parameter
        mycursor.execute(insert2, values2)
        engine.commit()

    
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
    while True:
        try:
            r = requests.get(STATIONS,params={"apiKey": APIKEY, "contract": NAME})
            data=json.loads(r.text)
            print(data[0])
            availability(data)
            time.sleep(5*60)
        except:
            print(traceback.format_exc())
            return
main()
