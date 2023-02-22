

sql = """CREATE TABLE station (
number INTEGER NOT NULL,
address VARCHAR(128),
banking INTEGER,
bike_stands INTEGER,
name VARCHAR(128),
position_lat FLOAT,
position_lng FLOAT,
PRIMARY KEY (number)
);
CREATE TABLE availability (
number INTEGER NOT NULL,
last_update DATETIME NOT NULL,
available_bikes INTEGER,
available_bike_stands INTEGER,
status VARCHAR(128),
PRIMARY KEY (number, last_update)
);

"""
import sqlalchemy as sqla
from sqlalchemy import create_engine
import traceback
import glob
import os
from pprint import pprint
import simplejson as json
import requests
import time
from IPython.display import display

try:
    res = create_engine.execute("DROP TABLE IF EXISTS station")
    res = create_engine.execute(sql)
    print(res.fetchall())
except Exception as e:
    print(e)