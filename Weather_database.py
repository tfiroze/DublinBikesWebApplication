sql = """CREATE TABLE weather (
time DATETIME NOT NULL,
temperature INTEGER,
wind speed INTEGER,
wind direction INTEGER,
weather code INT,
precipitation sum FLOAT,
rain sum FLOAT,
precipitation probability INT,
PRIMARY KEY (number)
);

"""
import mysql.connector

engine = mysql.connector.connect(host="softwaredb.ce0otalnccc9.eu-west-1.rds.amazonaws.com",user="soft",password="password",database="dublinbikes")
mycursor = engine.cursor()
mycursor.execute("CREATE DATABASE dublinbikes")
mycursor.execute(sql)
print(engine)

