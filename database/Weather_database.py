sql = """CREATE TABLE weather (
number INTEGER NOT NULL,
time DATETIME NOT NULL,
temperature INTEGER,
wind_speed INTEGER,
wind_direction INTEGER,
weather_code INTEGER,
precipitation_sum FLOAT,
rain_sum FLOAT,
precipitation_probability INTEGER,
PRIMARY KEY (number)
);

"""
import mysql.connector

engine = mysql.connector.connect(host="softwaredb.ce0otalnccc9.eu-west-1.rds.amazonaws.com",user="soft",password="password",database="dublinbikes")
mycursor = engine.cursor()
mycursor.execute(sql)
print(engine)

