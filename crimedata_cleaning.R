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

#create testing dataset 
dftest = df[1:100,2:29]
dftest = dftest[,-9]
dftest = dftest[,-9]
dftest = dftest[,-9]
dftest = dftest[,-10]
dftest = dftest[,-10]
dftest = dftest[,-10]
dftest = dftest[,-10]
dftest = dftest[,-10]
dftest = dftest[,-10]
dftest = dftest[,-11]
dftest = dftest[,-11]
dftest = dftest[,-11]
dftest = dftest[,-11]
dftest = dftest[,-11]
dftest = dftest[,-11]

write.csv(dftest, "test.csv", row.names = FALSE)

#consolidate crimes - lots of cleanup here!
dfcrimes = df
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code.Description == "CRUELTY TO ANIMALS"] = "ANIMAL CREULTY"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code.Description == "ARSON"] = "ARSON"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("236","622","623","624","625","626","627")] = "ASSAULT"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("230","231")] = "ASSAULT WITH A DEADLY WEAPON"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code.Description == "BATTERY WITH SEXUAL CONTACT"] = "BATTERY WITH SEXUAL CONTACT"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code.Description == "BOMB SCARE"] = "BOMB SCARE" 
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code.Description == "BRIBERY"] = "BRIBERY"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("310","320","330","410")] = "BURGLARY"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code.Description == "CHILD ABUSE (PHYSICAL) - AGGRAVATED ASSAULT"] = "CHILD ABUSE"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code.Description == "CHILD ANNOYING (17YRS & UNDER)"] = "CHILD ANNOYANCE"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("237","870")] = "CHILD NEGLECT"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code.Description == "CONSPIRACY"] = "CONSPIRACY"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code.Description == "CONTEMPT OF COURT"] = "CONTEMPT OF COURT"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("651","652","660")] = "COUNTERFEIT"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code.Description == "CRM AGNST CHLD (13 OR UNDER) (14-15 & SUSP 10 YRS OLDER)0060"] = "CRIME AGAINST CHILD"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("880","886")] = "DISTURBING THE PEACE"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code.Description == "DRUGS, TO A MINOR"] = "DRUGS, TO A MINOR"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code.Description == "EXTORTION"] = "EXTORTION" 
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code.Description == "DOCUMENT FORGERY / STOLEN FELONY"] = "FORGERY"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("653","654")] = "FRAUD"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code.Description == "CRIMINAL HOMICIDE"] = "HOMICIDE"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code.Description == "THEFT OF IDENTITY"] = "IDENTITY THEFT" 
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("910","920","922")] = "KIDNAPPING"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("762","956")] = "LEWD CONDUCT"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("435","436")] = "LYNCHING"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("113")] = "MANSLAUGHTER"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("432","433","647","661","890","924","926","946","954")] = "MISCELLANEOUS CRIME"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("932")] = "PEEPING TOM"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("805","806")] = "PIMPING"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("933")] = "PROWLER"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("121","122","815","821")] = "RAPE"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("438")] = "RECKLESS DRIVING"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("931")] = "REPLICA FIREARMS"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("437")] = "RESISTING ARREST"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("210","220","331","341","343","345","347","349","350","351","352","353","420","421","440","441","442","443","444","445","446","450","451","452","470","471","473","474","475","480","485","487","510","520","662","664","666","668","670","950","951")] = "ROBBERY"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("850","820","830","840","948","810")] = "SEXUAL CRIME"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("250","251","753")] = "SHOTS FIRED"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("763")] = "STALKING"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("928","930")] = "THREAT"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("888")] = "TRESPASSING"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("740","745")] = "VANDLISM"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("900","901","902","906")] = "VIOLATION OF COURT ORDER"
dfcrimes$Consolidated.Description[dfcrimes$Crime.Code %in% c("761","756")] = "WEAPONS POSESSION"

