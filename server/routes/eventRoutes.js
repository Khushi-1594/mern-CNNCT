import express from 'express'
import { copyEventLink, createEvent, deleteEvent, getUserById, getUserEvents, toggleEventStatus, updateEventTitle } from '../controllers/eventConroller.js';

const router = express.Router();

router.post("/create-event", createEvent);
router.get("/user-events", getUserEvents);
router.put("/update-title/:eventId", updateEventTitle);
router.put("/toggle-status/:eventId", toggleEventStatus);
router.delete("/delete/:eventId",deleteEvent)
router.get("/event-link/:eventId", copyEventLink)
router.get("/user/:id", getUserById);

export default router;