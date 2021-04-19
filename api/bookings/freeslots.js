const moment = require("moment");
const momenttimezone = require("moment-timezone");
const config = require("../../config/config.js");

async function createTimeSlots(date, db) {
  const startTime = new Date(
    moment(date).hour(config.startTime.hour).minute(config.startTime.minute)
  ).toUTCString();
  const endTime = new Date(
    moment(date).hour(config.endTime.hour).minute(config.endTime.minute)
  ).toUTCString();

  if (new Date(startTime) > new Date(endTime)) {
    throw new Error("Start Time Should be less than end Time");
  }

  const duration = config.slotDuration;

  let slotStartTime = startTime;
  while (new Date(slotStartTime) < new Date(endTime)) {
    let nextStartTime = new Date(slotStartTime);
    nextStartTime.setMinutes(nextStartTime.getMinutes() + duration);
    const data = {
      date: new Date(date).toUTCString(),
      startTime: new Date(slotStartTime).toUTCString(),
      endTime: new Date(nextStartTime).toUTCString(),
      isBooked: 0,
    };
    slotStartTime = nextStartTime;

    if (
      (new Date(slotStartTime).getTime() - new Date(endTime).getTime()) *
        1000 *
        60 *
        60 <
      duration
    ) {
      const docRef = db.collection(config.collection).doc();
      await docRef.set(data);
    }
  }
}

function prepareSlots(slots, timezone) {
  let slotsArray = [];
  slots.forEach((doc) => {
    const { startTime, endTime } = doc.data();
    const tmp = {
      startTime: startTime,
      endTime: endTime,
    };
    slotsArray.push(tmp);
  });

  //   sort slots based on startTime
  slotsArray = slotsArray.sort((a, b) => {
    if (new Date(a.startTime) > new Date(b.startTime)) return 1;
    if (new Date(a.startTime) < new Date(b.startTime)) return -1;
    return 0;
  });

  return slotsArray.map((slot) =>
    __formatTimeSlots(slot.startTime, slot.endTime, timezone)
  );
}

function __formatTimeSlots(startTime, endTime, timezone = config.timezone) {
  return `${momenttimezone
    .tz(startTime, timezone)
    .format("LLL")} - ${momenttimezone.tz(endTime, timezone).format("LLL")}`;
}

module.exports = {
  createTimeSlots,
  prepareSlots,
};
