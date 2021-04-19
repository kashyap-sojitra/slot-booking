const moment = require("moment");
const config = require("../../config/config.js");

function validateTime(datetime, duration) {
  const startTime = new Date(
    moment(datetime).hour(config.startTime.hour).minute(config.startTime.minute)
  );
  const endTime = new Date(
    moment(datetime).hour(config.endTime.hour).minute(config.endTime.minute)
  );

  let slotEndTime = new Date(datetime);
  slotEndTime.setMinutes(slotEndTime.getMinutes() + duration);

  if (
    new Date(datetime) < new Date(startTime) ||
    new Date(datetime) >= new Date(endTime) ||
    new Date(slotEndTime) > new Date(endTime)
  ) {
    return 0;
  }
  return 1;
}

async function createEvent(res, db, datetime, duration) {
  const eventsRef = db.collection(config.collection);

  const slotStartTime = new Date(datetime).toUTCString();
  const slotEndTime = new Date(
    new Date(datetime).setMinutes(new Date(datetime).getMinutes() + duration)
  ).toUTCString();

  const startSlots = await eventsRef
    .where("startTime", ">", slotStartTime)
    .where("startTime", "<", slotEndTime)
    .get();

  const endSlots = await eventsRef
    .where("endTime", ">", slotStartTime)
    .where("endTime", "<=", slotEndTime)
    .get();

  let slotsArray = [];
  startSlots.forEach((doc) => {
    const { startTime, endTime, date, isBooked } = doc.data();
    const tmp = {
      doc: doc.id,
      date: date,
      startTime: startTime,
      endTime: endTime,
      isBooked: isBooked,
    };
    slotsArray.push(tmp);
  });

  endSlots.forEach((doc) => {
    const { startTime, endTime, date, isBooked } = doc.data();
    const tmp = {
      doc: doc.id,
      date: date,
      startTime: startTime,
      endTime: endTime,
      isBooked: isBooked,
    };
    slotsArray.push(tmp);
  });

  let uniqueSlots = [];
  slotsArray.forEach((item) => {
    const tmp = uniqueSlots.find((f) => f.doc == item.doc);
    if (!tmp) {
      uniqueSlots.push(item);
    }
  });

  uniqueSlots = uniqueSlots.filter((slot) => slot.isBooked === 0);

  if (uniqueSlots.length === 0) {
    res.status(422).json({
      message: "Cannot book an Event for given time and duration",
    });
  } else if (uniqueSlots.length === 1) {
    let localSlotEndTime = new Date(datetime);
    localSlotEndTime.setMinutes(localSlotEndTime.getMinutes() + duration);
    if (
      uniqueSlots[0].isBooked ||
      new Date(localSlotEndTime) > new Date(uniqueSlots[0].endTime) ||
      new Date(datetime) < new Date(uniqueSlots[0].startTime)
    ) {
      res.status(422).json({
        message: "Cannot book an Event for given time and duration",
      });
    } else {
      await db.collection(config.collection).doc(uniqueSlots[0].doc).delete();
      const data = {
        date: uniqueSlots[0].date,
        startTime: slotStartTime,
        endTime: slotEndTime,
        duration: duration,
        isBooked: 1,
      };
      const docRef = db.collection(config.collection).doc();
      await docRef.set(data);
      res.status(200).json({ message: "Event Created Successfully" });
    }
  } else {
    for (const slot of uniqueSlots) {
      await db.collection(config.collection).doc(slot.doc).delete();
    }
    const data = {
      date: uniqueSlots[0].date,
      startTime: slotStartTime,
      endTime: slotEndTime,
      duration: duration,
      isBooked: 1,
    };
    const docRef = db.collection(config.collection).doc();
    await docRef.set(data);
    res.status(200).json({ message: "Event Created Successfully" });
  }
}

module.exports = {
  validateTime,
  createEvent,
};
