from geopy.extra.rate_limiter import RateLimiter
from geopy.geocoders import Nominatim
from geopy import geocoders


#######################################
##    It needs to add the dataframe, ##
##    which is our cleaned data !    ##
##                                   ##
######################################

geolocator = Nominatim(user_agent='myapplication')


locator = Nominatim(user_agent="myGeocoder")


print(len(df_export['County']))

latitudes = []
longitudes = []

with open('result.txt', 'w') as file:
    file.write("city,latitude,longitude\n")
    
    county = df_export['County'].to_numpy()
    city = df_export['City'].to_numpy()
    print(county,city)
    
    # it takes really long!
    for i in range(10):
    #for i in range(len(df_export['County'])):
        query = ""
        if city[i] == "Not in a city":
            query = county[i]
        elif city[i] == county[i]: #only query county
            query = county[i]
        else:                     #query city
            query = city[i] + " "+ county[i]
            
        location = geolocator.geocode(query)
        latitudes.append(location.latitude)
        longitudes.append(location.longitude)
        
        c = str(query)
        lat = str(location.latitude)
        long = str(location.longitude)
        result = c+","+lat+","+long+"\n"
        file.write(result)
    
print(latitudes,longitudes)