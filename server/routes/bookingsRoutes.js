import express from 'express'
import { acceptEventRequest, getCanceledEvents, getPastEvents, getPendingEvents, getUpcomingEvents, rejectEventRequest } from '../controllers/bookingsController.js';

const router = express.Router();

router.get("/upcoming", getUpcomingEvents);
router.get("/pending", getPendingEvents);
router.get("/canceled", getCanceledEvents);
router.get("/past", getPastEvents);
router.post("/accept/:eventId", acceptEventRequest);
router.post("/reject/:eventId", rejectEventRequest);

export default router;