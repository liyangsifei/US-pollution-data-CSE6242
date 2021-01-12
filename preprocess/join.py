import os
import pandas as pd
import numpy as np
import random
from datetime import datetime
import matplotlib as mpl
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation


from argparse import ArgumentParser



def load_data(filename):

    try:
        df = pd.read_csv(filename)
        print("Data has",len(df),"rows and", len(df.columns),"columns.")
    except:
        print("Load  " + filename + " data error!")
        exit()
    return df


def save_data(data ,filename):
    data.to_csv(filename)
    print("save data " + filename)



if __name__ == '__main__':

    parser = ArgumentParser()

    parser.add_argument( dest='A', help='input data name [A]')
    parser.add_argument(dest='B', help='output data name [B]')

    if parser.parse_args().A is None:
        dataname = "pollution_us_2000_2016-cleaned.csv"
    else:
        dataname = parser.parse_args().A

    if parser.parse_args().B is None:
        output = "output.csv"
    else:
        output = parser.parse_args().B


    print(dataname, output)

    data = load_data(dataname)
    coor = load_data("coordinates.csv")
    df_export = pd.merge(data, coor, on=['State', 'County', 'City'], how='left')

    print(df_export)

    save_data(df_export, output)