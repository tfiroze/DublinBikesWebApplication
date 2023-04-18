
def station(data):
    for i in range(0,len(data)):
        
        insert_query1 = f"INSERT INTO station (number, address, banking,  bike_stands,name, position_lat,position_lng) VALUES (%s, %s, %s, %s, %s, %s, %s)"
        values1 = (
                data[i]['number'],
                data[i]['address'],
                data[i]['banking'],
                data[i]['bike_stands'],
                data[i]['name'],
                data[i]['position']['lat'],
                data[i]['position']['lng']
            )
        # execute the query with the dictionary string as a parameter
        mycursor.execute(insert_query1, values1)
        engine.commit()

    
import mysql.connector

engine = mysql.connector.connect(host="softwaredb.ce0otalnccc9.eu-west-1.rds.amazonaws.com",user="soft",password="password",database="dublinbikes")
mycursor = engine.cursor()

import requests
import json
NAME="Dublin" # name of contract
STATIONS="https://api.jcdecaux.com/vls/v1/stations"
APIKEY = "772474ead9d6527be32fcb2c7b1d631d990fa561"
r = requests.get(STATIONS,params={"apiKey": APIKEY, "contract": NAME})
data=json.loads(r.text)
station(data)


