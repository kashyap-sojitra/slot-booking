require("dotenv").config();
const router = require("express").Router();
const admin = require("firebase-admin");

const config = require("../../config/config.js");
const { createTimeSlots, prepareSlots } = require("./freeslots.js");
const { validateTime, createEvent } = require("./createEvent.js");
const { getEvents } = require("./getEvents.js");

const serviceAccount = require("../../config/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = () => {
  // POST /api/free-slots
  router.post("/free-slots", async (req, res) => {
    try {
      const { date, timezone } = req.body;

      const eventsRef = db.collection(config.collection);

      let eventSlots = await eventsRef
        .where("date", "==", new Date(date).toUTCString())
        .where("isBooked", "==", 0)
        .get();

      if (eventSlots.docs.length === 0) {
        await createTimeSlots(date, db);
        eventSlots = await eventsRef
          .where("date", "==", new Date(date).toUTCString())
          .where("isBooked", "==", 0)
          .get();
      }

      const availableSlots = prepareSlots(eventSlots, timezone);

      res.status(200).json({
        message: "Available Slots",
        slots: availableSlots,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });

  // POST /api/create-event
  router.post("/create-event", async (req, res) => {
    try {
      const { datetime, duration } = req.body;
      const isTimeValid = validateTime(datetime, duration);
      if (!isTimeValid) {
        res.status(422).json({
          message: "Cannot book an Event for given time and duration",
        });
      } else {
        await createEvent(res, db, datetime, duration);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });

  // GET /api/get-events
  router.get("/get-events", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const eventsRef = db.collection(config.collection);

      const eventSlots = await eventsRef.where("isBooked", "==", 1).get();
      const eventDetails = [];
      eventSlots.forEach((doc) => {
        eventDetails.push(doc.data());
      });

      const events = getEvents(startDate, endDate, eventDetails);
      res
        .status(200)
        .json({ message: "Events fetched Successfully", events: events });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  });
  return router;
};
