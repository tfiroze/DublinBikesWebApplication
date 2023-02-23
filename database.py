

sql = """CREATE TABLE station (
number INTEGER NOT NULL,
address VARCHAR(128),
banking INTEGER,
bike_stands INTEGER,
name VARCHAR(128),
position_lat FLOAT,
position_lng FLOAT,
PRIMARY KEY (number)
);"""
pql="""CREATE TABLE availability (
number INTEGER NOT NULL,
last_update DATETIME NOT NULL,
available_bikes INTEGER,
available_bike_stands INTEGER,
status VARCHAR(128),
PRIMARY KEY (number, last_update)
);"""

import mysql.connector

engine = mysql.connector.connect(host="softwaredb.ce0otalnccc9.eu-west-1.rds.amazonaws.com",user="soft",password="password",database="dublinbikes")
mycursor = engine.cursor()
mycursor.execute(sql)
mycursor.execute(pql)
print(engine)

