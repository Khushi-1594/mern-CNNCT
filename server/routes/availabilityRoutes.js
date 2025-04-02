import express from 'express';
import { getCalendarMeetings, setAvailability } from '../controllers/availabilityContoller.js';

const router = express.Router();

router.put('/set-availability', setAvailability);
router.get('/calendar-view', getCalendarMeetings);


export default router;