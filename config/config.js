// startTime and endTime are an object having the start and end time hour and minute
const startTime = {
  hour: 8, // 0 to 23
  minute: 0, // 0 to 59
};
const endTime = {
  hour: 17, // 0 to 23
  minute: 0, // 0 to 59
};

// slot duration in minutes (anything greater than 60 will automicatically converts to hours and minutes)
const slotDuration = 30;

// default timezone based on which slots will be created
const timezone = "America/Los_Angeles";

// utc timezone
const utcTimezone = "Africa/Abidjan";

// collection name
const collection = "events";

module.exports = {
  startTime,
  endTime,
  slotDuration,
  timezone,
  collection,
  utcTimezone,
};
