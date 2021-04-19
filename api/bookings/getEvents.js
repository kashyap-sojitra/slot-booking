const moment = require("moment");
const momenttimezone = require("moment-timezone");
const config = require("../../config/config.js");

function getEvents(startDate, endDate, events) {
  startDate = new Date(moment(startDate).hour(0).minute(0).second(0));
  endDate = new Date(moment(endDate).hour(23).minute(59).second(59));

  events = events.map((slot) => {
    if (
      new Date(slot.startTime) >= new Date(startDate) &&
      new Date(slot.endTime) <= new Date(endDate)
    ) {
      return slot;
    }
  });

  events = events.filter((f) => f);
  return events.map((slot) => {
    return {
      date: slot.date,
      time: __formatTimeSlots(slot.startTime, slot.endTime),
    };
  });
}

function __formatTimeSlots(startTime, endTime, timezone = config.timezone) {
  return `${momenttimezone
    .tz(startTime, timezone)
    .format("LT")} - ${momenttimezone.tz(endTime, timezone).format("LT")}`;
}

module.exports = {
  getEvents,
};
