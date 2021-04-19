# setup instructions 

clone the project using the command: git clone https://github.com/kashyap-sojitra/slot-booking.git

cd slot-booking

run npm install

run node index.js

you can then access different APIs on localhost:3000/{{endpoints-mentioned-below}}

localhost:3000/api/free-slots

localhost:3000/api/create-event

localhost:3000/api/get-events?startDate="2021-04-19"&endDate="2021-04-20"


# slot-booking

There are total 3 end points

POST: /api/free-slots => it looks for free slots in the firestore and if no slots found for that particular date creates slots based on default values stored in config i.e startTime, endTime, duration, timezone
sample body(JSON):
{
    "date": "2021-04-21"
}

POST: /api/create-event => it creates an event of given duration for given datetime. If slot is already booked or out of operating time then returns status 422.
sample body(JSON):
{
    "datetime": "2021-04-21 16:00",
    "duration": 30
}

GET: /api/get-events => it returns all booked slots between startDate and endDate
params send as query string:
startDate = "2021-04-19"
endDate = "2021-04-20"
example url: {{domain}}/api/get-events?startDate="2021-04-19"&endDate="2021-04-20"
