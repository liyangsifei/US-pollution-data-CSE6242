import os
import pandas as pd
import numpy as np
import random
from datetime import datetime
import matplotlib as mpl
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation



def load_data(filename):
    try:
        df = pd.read_csv(filename)
        print("Data has",len(df),"rows and", len(df.columns),"columns.")
    except:
        print("Load data error!")
        exit()

    return df


def save_data(data ,filename):
    data.to_csv(filename)
    print("save data " + filename)


if __name__ == '__main__':
    data = load_data("AllFour_2017_2020.csv")    
    #data = data.drop(columns=['State Code','County Code','Site Num','Address','NO2 Units','O3 Units','SO2 Units','CO Units'], inplace=True)
    prev = data.head(10000)
    print(prev)
    save_data(prev, "prev_10000.csv")