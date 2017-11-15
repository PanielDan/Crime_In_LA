########################################
# This R code is for processing        #
# publically available LA crime data   #
# for plotting and manipulation in d3. #
########################################
#import libraries
library(tidyr)
library(dplyr)
library(reshape2)
library(lubridate)
library(ggplot2)
library(data.table)

#set wd
setwd("~/Documents/infGit")

#load raw data 
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

#separate latitude and longitude values 
df = separate(data = df, col = Location, into = c("none", "Location"), sep="\\(")
df = df[,-26]
df = separate(data = df, col = Location, into = c("Latitude", "Longitude"), sep="\\, ")
df = separate(data = df, col = Longitude, into = c("Longitude", "none"), sep="\\)")
df = df[,-28]

#set data types for each column
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

#summary(df)

#add day of the week, month, and year
df$Weekday = weekdays(df$Date.Occurred)
df$Month = months(df$Date.Occurred)
df$Year = format(df$Date.Occurred, '%Y')

#create testing dataset 
dftest = df[1:100,c(2:6,8:9,13,19,26:30)]
write.csv(dftest, "test.csv", row.names = FALSE)

#consolidate crimes - lots of cleanup here!
dfcrimes = df
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("943","236","622","623","624","625","626","627","230","231","860","235","435","436","121","122","815","821","820","250","251","753","928","930")] = "Assault and Battery"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("648","755","926","924","740","745")] = "Destruction of Property"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("813","237","870","880","886","884","882","762","956","432","932","933","850","763","888")] = "Domestic Disturbance"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("653","654","942","651","652","660","649","354")] = "Fraud"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("110","113")] = "Homicide"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("940","805","806")] = "Human Trafficking"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("910","920","922")] = "Kidnapping"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("944","903","812","865","434","439","949","433","647","661","890","946","954","438","931","830","840","948","810","900","901","902","906","761","756")] = "Miscellaneous White-Collar Crime"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("437")] = "Resisting Arrest"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("310","320","330","410","210","220","331","341","343","345","347","349","350","351","352","353","420","421","440","441","442","443","444","445","446","450","451","452","470","471","473","474","475","480","485","487","510","520","662","664","666","668","670","950","951")] = "Theft"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("")] = "Unspecified"
dfcrimes$Consolidated.Description = as.factor(dfcrimes$Consolidated.Description)


#dataframes or entries with valid lat/lon
df.l = df[df$Latitude != 0,]
dfcrimes.l = dfcrimes[dfcrimes$Latitude != 0,]

#data for only 2010 and 2015
df.2010 = df[df$Year %in% c("2010"),]
df.2015 = df[df$Year %in% c("2015"),]
dfcrimes.2010 = dfcrimes[dfcrimes$Year %in% c("2010"),]
dfcrimes.2015 = dfcrimes[dfcrimes$Year %in% c("2015"),]
df.l.2010 = df.l[df.l$Year %in% c("2010"),]
df.l.2015 = df.l[df.l$Year %in% c("2015"),]
dfcrimes.l.2010 = dfcrimes.l[dfcrimes.l$Year %in% c("2010"),]
dfcrimes.l.2015 = dfcrimes.l[dfcrimes.l$Year %in% c("2015"),]
#data for heat maps
#2010
df.hm.2010 = dfcrimes.l.2010[,c("Date.Reported","Date.Occurred","Time.Occurred","Crime.Code","Latitude","Longitude","Weekday","Month","Year","Consolidated.Description")]
write.csv(df.hm.2010, "heatmap_2010.csv", row.names = FALSE)

#data for simulation - count the data for 2010 and 2015 in each crime category 
df.sim = dfcrimes.reduced[,c(30:31)]
df.sim.m = dcast(df.sim, Year~Consolidated.Description)
write.csv(df.sim.m, "simulation.csv", row.names = FALSE)

#data for interactive slope graph 
df.sg = dfcrimes[,c(4:6,8,28:31)]
df.sg = df.sg[-1]
df.sg.m = dcast(df.sg, Area.Name + Year~Consolidated.Description)
write.csv(df.sg.m, "slopegraph.csv", row.names = FALSE)

#data for bar charts - also coutns?
df.bc = dfcrimes.reduced[,c(2:6,8,13,19,28:31)]
write.csv(df.bc, "barchart.csv", row.names = FALSE)
