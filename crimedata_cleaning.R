########################################
# This R code is for processing        #
# publically available LA crime data   #
# for plotting and manipulation in d3. #
########################################
#import libraries
library(tidyr)
library(dplyr)
library(lubridate)
library(ggplot2)

#set wd
setwd("~/Desktop/infGit")

#load data 
data = read.csv("Crime_Data_from_2010_to_Present.csv", header=TRUE) #26 variables, 1,500,000+ observations

#find out a bit about our data 
str(data)
# $ DR.Number             : int  
# $ Date.Reported         : Factor w/ 2830 levels 
# $ Date.Occurred         : Factor w/ 2830 levels 
# $ Time.Occurred         : int  
# $ Area.ID               : int  
# $ Area.Name             : Factor w/ 21 levels 
# $ Reporting.District    : int  
# $ Crime.Code            : int  
# $ Crime.Code.Description: Factor w/ 136 levels 
# $ MO.Codes              : Factor w/ 351243 levels 
# $ Victim.Age            : int  
# $ Victim.Sex            : Factor w/ 6 levels 
# $ Victim.Descent        : Factor w/ 21 levels 
# $ Premise.Code          : int  
# $ Premise.Description   : Factor w/ 211 levels 
# $ Weapon.Used.Code      : int  
# $ Weapon.Description    : Factor w/ 80 levels 
# $ Status.Code           : Factor w/ 10 levels 
# $ Status.Description    : Factor w/ 6 levels 
# $ Crime.Code.1          : int  
# $ Crime.Code.2          : int  
# $ Crime.Code.3          : int  
# $ Crime.Code.4          : int  
# $ Address               : Factor w/ 71088 levels 
# $ Cross.Street          : Factor w/ 11167 levels
# $ Location              : Factor w/ 60690 levels 

#build our dataframe to manipulate:
df = data

#separate latitude and logitude values 
df = separate(data = df, col = Location, into = c("none", "Location"), sep="\\(")
df = df[,-26]
df = separate(data = df, col = Location, into = c("Latitude", "Longitude"), sep="\\, ")
df = separate(data = df, col = Longitude, into = c("Longitude", "none"), sep="\\)")
df = df[,-28]

#set proper data types for each column
df$Date.Reported = strptime(as.character(df$Date.Occurred), "%m/%d/%Y")
df$Date.Occurred = strptime(as.character(df$Date.Occurred), "%m/%d/%Y")
df$Area.ID = as.factor(df$Area.ID) 
df$Reporting.District = as.factor(df$Reporting.District)
df$Crime.Code = as.factor(df$Crime.Code)
df$Premise.Code = as.factor(df$Premise.Code)
df$Weapon.Used.Code = as.factor(df$Weapon.Used.Code)
df$Crime.Code.1 = as.factor(df$Crime.Code.1)
df$Crime.Code.2 = as.factor(df$Crime.Code.2)
df$Crime.Code.3 = as.factor(df$Crime.Code.3)
df$Crime.Code.4 = as.factor(df$Crime.Code.4)
df$Latutude = as.integer(df$Latitude)
df$Longitude = as.integer(df$Longitude)

#summary(df)

#dataframe only for entries with valid lat/lon
dfloc = df[df$Latitude != 0,]


