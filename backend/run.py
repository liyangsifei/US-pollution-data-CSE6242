import flask

from flask import Flask, render_template, request, json, jsonify, g
import csv
import pandas as pd
import sqlite3
import json
from bson import json_util

from flask_mongoengine import MongoEngine

from flask_pymongo import PyMongo

from pymongo import MongoClient

app = flask.Flask(__name__)
app.config["DEBUG"] = True
app.config['APPLICATION_ROOT'] = "/air"

from bson.objectid import ObjectId

conn = MongoClient()

db = conn.test1
collection = db.v1
collection.stats

cursor = collection.find({'name': 'Jon Snow'})

def parse_json(data):
    return json.loads(json_util.dumps(data))

def to_json2(df, orient="records"):
    df_json = df.to_json(orient=orient)
    return json.loads(df_json)
# render template
@app.route("/", methods=['GET'])
def homepage():
    return render_template('index.html')

@app.route("/air/county", methods=['GET', 'POST'])
def air_county():
    print("switch to air county")
    collection = db.v1

    method = 1 # 1: load from backend; 3: load from frontend
    prediction = {"pred": [1,2,3,4,5]}

    if method == 1:
        air_data = collection.find({})
        df = pd.DataFrame(data=list(air_data), columns = ["_id", "State", "County", "City","Date Local","NO2 Mean","NO2 1st Max Value","NO2 1st Max Hour","NO2 AQI","O3 Mean","O3 1st Max Value","O3 1st Max Hour","O3 AQI","SO2 Mean", "SO2 1st Max Value","SO2 1st Max Hour","SO2 AQI","CO Mean","CO 1st Max Value","CO 1st Max Hour","CO AQI","Latitude","Longitude"])
        df.drop(["_id"], axis=1, inplace=True)
        df.fillna(0, inplace=True)
        air_data = to_json2(df)
    else:
        air_data = 0
    print("load data finished")
    # if full_data == 1:
    #     df["Date Local"] = pd.to_datetime(df['Date Local'],format='%Y-%m-%d')
    #     g = df.groupby(['State',pd.Grouper(key='Date Local', freq='M')])
    #     result = g.mean()
    #     result.sort_values(by="Date Local")
    #     df = result
    #     df.reset_index(drop=False, inplace=True)
    data = {'method': method, 'air': air_data, 'prediction_data': prediction}
    return render_template('air_v2.html', data=data)

@app.route("/air/state", methods=['GET', 'POST'])
def air_state():
    print("switch to air state")
    collection = db.v1
    method = 0 # 0: load from backend; 2: load from frontend
    
    if method  == 0:
        air_data = collection.find({})
        df = pd.DataFrame(data=list(air_data), columns = ["_id", "State", "County", "City","Date Local","NO2 Mean","NO2 1st Max Value","NO2 1st Max Hour","NO2 AQI","O3 Mean","O3 1st Max Value","O3 1st Max Hour","O3 AQI","SO2 Mean", "SO2 1st Max Value","SO2 1st Max Hour","SO2 AQI","CO Mean","CO 1st Max Value","CO 1st Max Hour","CO AQI","Latitude","Longitude"])
        df.drop(["_id"], axis=1, inplace=True)
    # if full_data == 1:
    #     df["Date Local"] = pd.to_datetime(df['Date Local'],format='%Y-%m-%d')
    #     g = df.groupby(['State',pd.Grouper(key='Date Local', freq='M')])
    #     result = g.mean()
    #     result.sort_values(by="Date Local")
    #     df = result
    #     df.reset_index(drop=False, inplace=True)
        df["Date Local"] = pd.to_datetime(df['Date Local'],format='%Y-%m-%d')
        g = df.groupby(['State',pd.Grouper(key='Date Local', freq='M')])
        result = g.mean()
        result.sort_values(by="Date Local")
        df = result
        df.reset_index(drop=False, inplace=True)
        df["Date Local"] = df["Date Local"].dt.strftime('%Y-%m-%d')
        df.fillna(0, inplace=True)
        air_data = to_json2(df)
    else:
        air_data = 0
    print("load data finished")
    data = {'method': method, 'air': air_data}
    return render_template('air_v2.html', data=data)

@app.route("/marine",methods=['GET', 'POST'])
def marine():
    # df = pd.read_csv('full_data_marine.csv')
    # df = pd.DataFrame()
    # prediction = df.to_dict(orient='records')
    # data = {'prediction_data': prediction}
    print("switch to marine")
    collection = db.marine
    marine_data = collection.find({})
    #print(marine_data)
    method = 0

    df = pd.DataFrame(data=list(marine_data), columns = ["year", "parameter","result","latitude","longitude"])

    df["year"] = pd.to_datetime(df['year'],format='%Y')

    marine_data = to_json2(df)
    data = {'method': method, 'marine': marine_data}
    print("pass marine data")
    return render_template('marine.html', data=data)

@app.route("/marine/predict", methods=['GET'])
def marine_predict():
    prediction = {"pred": [1,2,3,4,5]}
    # need to modify
    data = {'prediction_data': prediction}
    return render_template('marine_predict.html', data=data)

@app.route("/air/predict", methods=['GET'])
def air_predict():
    prediction = {"pred": [1,2,3,4,5]}
        # need to modify
    data = {'prediction_data': prediction}
    return render_template('air_predict.html', data=data)

@app.route("/air/cluster", methods=['GET'])
def air_cluster():
    prediction = {"pred": [1,2,3,4,5]}
        # need to modify
    data = {'prediction_data': prediction}
    return render_template('air_cluster.html', data=data)

@app.route("/feedback", methods=['GET'])
def feedback():
    return render_template('feedback.html')

@app.route('/getfeedback', methods=['POST','GET'])
def getfeedback():
    user_input_json = request.json
    # data = request.get_json(force=True)#獲取json資料
    print(user_input_json)
    #username =data['username']
    #password =data['psw']
    #print(username)
    #print(password)
    #return username
    return {}


#close db
@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()
def execute_query(query, args=()):
    cur = get_db().execute(query, args)
    rows = cur.fetchall()
    cur.close()
    return rows

@app.errorhandler(404)
def page_not_found(e):
    return render_template('err_page.html')

app.run()
