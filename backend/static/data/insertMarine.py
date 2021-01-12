import time
import pandas as pd
import numpy as np
from pymongo import MongoClient

client = MongoClient()
database = client['test1']
collection = database['marine']

def csv_to_json(filename, header=None):
    data = pd.read_csv(filename, header=0)
    data = data.drop('Unnamed: 0', 1)
    print(data)
    trans_data = data.to_dict('records')
    print(trans_data[0])
    return trans_data

def csv_to_json2(filename, header=None):
    data = pd.read_csv(filename, header=0)
    print(data)
    trans_data = data.to_dict('records')
    print(trans_data[0])
    return trans_data

d = collection.delete_many({})
print(d.deleted_count, "has been deleted.")

start = time.time()
filename = "marine_data.csv"
# filename = "result.csv"
# filename2 = "result_17-20.csv"
insert_data  = csv_to_json2(filename)
#print(insert_data)
collection.insert_many(insert_data)
print("Insert data:  " + filename + " to db " + str(database))
elapsed = time.time() - start
print("Elapsed time: ", elapsed)
