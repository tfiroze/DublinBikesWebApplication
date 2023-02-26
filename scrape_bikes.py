
def stat(data):
    
    item_str = json.dumps(data[0])
    insert_query1 = f"INSERT INTO station (number, address, banking,  bike_stands,name, position_lat,position_lng) VALUES (%s, %s, %s, %s, %s, %s, %s)"
    values1 = (
            data[0]['number'],
            data[0]['address'],
            data[0]['banking'],
            data[0]['bike_stands'],
            data[0]['name'],
            data[0]['position']['lat'],
            data[0]['position']['lng']
        )
    insert2=f"INSERT INTO availability (number,last_update,available_bikes,available_bike_stands,status) Values(%s,%s,%s,%s,%s)"
    values2=(
            data[0]['number'],
            data[0]['last_update'],
            data[0]['available_bikes'],
            data[0]['available_bike_stands'],
            data[0]['status'])
            
    # execute the query with the dictionary string as a parameter
    mycursor.execute(insert_query1, values1)
    engine.commit()
    mycursor.execute(insert2, values2)
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
stat(data)


