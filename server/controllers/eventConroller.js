import { parseISO, isWithinInterval, format, addHours } from "date-fns";
import Event from "../models/events.js";
import User from "../models/user.js";
import { format as formatTZ, toZonedTime} from "date-fns-tz";

function isUserAvailable(userAvailability,eventDateTimeUTC, eventDuration, userTimeZone) {
  const eventDateObj = new Date(eventDateTimeUTC);
  const eventDate = format(eventDateObj, "yyyy-MM-dd");
  const eventStartLocal = toZonedTime(eventDateObj, userTimeZone);
  const eventEndLocal = addHours(eventStartLocal, eventDuration);

  const availableDate = userAvailability.find((a) => 
    format(typeof a.date === "string" ? parseISO(a.date) : a.date, "yyyy-MM-dd") === eventDate
  );
  
  if (!availableDate) return true;

  if (availableDate.slots.length === 0) {
    return true;
  }

  return availableDate.slots.some((slot) => {
    const [slotStartHour, slotStartMinute] = slot.startTime.split(":").map(Number);
    const [slotEndHour, slotEndMinute] = slot.endTime.split(":").map(Number);

    const slotStart = new Date(`${eventDate}T${slotStartHour.toString().padStart(2, "0")}:${slotStartMinute.toString().padStart(2, "0")}:00`);
    const slotEnd = new Date(`${eventDate}T${slotEndHour.toString().padStart(2, "0")}:${slotEndMinute.toString().padStart(2, "0")}:00`);
    return (
      isWithinInterval(eventStartLocal, { start: slotStart, end: slotEnd }) &&
      isWithinInterval(eventEndLocal, { start: slotStart, end: slotEnd })
    );
  });
}

async function checkEventConflicts(userId, eventDateTime, eventDuration) {
    const eventStart = eventDateTime;
    const eventEnd = addHours(eventStart, eventDuration);
    const eventDateOnly = format(eventStart, "yyyy-MM-dd");

    const conflictingEvents = await Event.find({
      "participants.user": userId,
      organizer: { $ne: userId }, 
      date: {
        $gte: new Date(`${eventDateOnly}T00:00:00.000Z`),
        $lt: new Date(`${eventDateOnly}T23:59:59.999Z`)
      }
    });
  
    return conflictingEvents.filter((event) => {
      const eventStoredStart = event.date;
      const eventStoredEnd = addHours(eventStoredStart, event.duration);
  
      return (
        (eventStoredStart < eventEnd && eventStoredStart >= eventStart) || 
        (eventStoredStart <= eventStart && eventStoredEnd > eventStart) 
      );
    });
  }
  
  

  async function checkOrganizingConflict(userId, eventDateTime, eventDuration) {
    const eventStart = eventDateTime;
    const eventEnd = addHours(eventStart, eventDuration);
    const eventDateOnly = format(eventStart, "yyyy-MM-dd");

    const organizerEvents = await Event.find({
      organizer: userId,
      date: {
        $gte: new Date(`${eventDateOnly}T00:00:00.000Z`),
        $lt: new Date(`${eventDateOnly}T23:59:59.999Z`)
      }
    });
  
    return organizerEvents.find((event) => {
      const eventStoredStart = event.date;
      const eventStoredEnd = addHours(eventStoredStart, event.duration);
  
      return (
        (eventStoredStart < eventEnd && eventStoredStart >= eventStart) || 
        (eventStoredStart <= eventStart && eventStoredEnd > eventStart) 
      );
    });
  }
  
  

export async function createEvent(req, res) {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      date,
      duration,
      participants,
      eventLink,
      password,
      timezone,
    } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required." });
    }

    if (typeof date !== "string") {
      return res.status(400).json({ success: false, message: "Invalid date format." });
    }

    const eventDate = new Date(date);

    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date provided." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (participants.includes(user.email)) {
      return res
        .status(400)
        .json({
          success: false,
          code: "ORGANIZER_EMAIL",
        });
    }

    const eventDateConversion = typeof date === "string" ? parseISO(date) : date;
    if (!date) {
      return res.status(400).json({ success: false, message: "Invalid date provided." });
    }
    if (!isUserAvailable(user.availability, eventDateConversion, duration, timezone)) {
      return res
        .status(400)
        .json({
          success: false,
          code: "USER_NOT_AVAILABLE",
        });
    }

    const organizerConflict = await checkOrganizingConflict(
      userId,
      eventDate,
      duration
    );
    if (organizerConflict) {
      return res.status(400).json({
        success: false,
        code: "ORGANIZER_CONFLICT",
      });
    }

    const conflictingEvent = await checkEventConflicts(
      userId,
      eventDate,
      duration
    );

    const validParticipants = await User.find({ email: { $in: participants } });

    if (validParticipants.length !== participants.length) {
      return res
        .status(400)
        .json({
          success: false,
          code: "INVALID_EMAIL",
        });
    }

    const newEvent = new Event({
      title,
      description,
      date: eventDate,
      duration,
      organizer: userId,
      participants: [
        { user: userId, status: "accepted" },
        ...validParticipants.map((u) => ({ user: u._id, status: "pending" })),
      ],
      eventLink,
      password,
    });

    await newEvent.save();

    await User.updateMany(
      { _id: { $in: validParticipants.map((u) => u._id) } },
      { $push: { attendingEvents: newEvent._id } }
    );

    await User.findByIdAndUpdate(
      userId,
      { $push: { createdEvents: newEvent._id } },
      { new: true }
    );

    if (conflictingEvent.length > 0) {
      return res.status(201).json({
         code: "SCHEDULING_CONFLICT",
        event: newEvent,
        conflicts: conflictingEvent,
      });
    }

    res
      .status(201)
      .json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    console.error("Error in createEvent controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}


export async function getUserEvents(req, res) {
  try {
    const userId = req.user.id;
    const userTimeZone = req.query.timezone || "UTC";
    const user = await User.findById(userId).populate("createdEvents")
    if(!user){
      return res.status(404).json({success: false, message: "User not found"});
    }
    const formattedEvents = await Promise.all(user.createdEvents.map(async (event) => {
      const localDate = toZonedTime(event.date, userTimeZone);
      const formattedDate = formatTZ(localDate, "EEEE, d MMM", {timeZone: userTimeZone});
      const formattedTime = `${formatTZ(localDate, "hh:mm a", { timeZone: userTimeZone })} - ${formatTZ(toZonedTime(new Date(event.date.getTime() + event.duration * 3600000), userTimeZone), "hh:mm a", { timeZone: userTimeZone })}`;
      
      // Check if this event has conflicts
      const conflicts = await checkEventConflicts(userId, event.date, event.duration);
      const hasConflict = conflicts.length > 0 && conflicts.some(conflict => conflict._id.toString() !== event._id.toString());
      
      return {
        ...event.toObject(),
        formattedDate,
        formattedTime,
        hasConflict
      };
    }));
    res.status(200).json({success: true, events: formattedEvents})
  } catch (error) {
    console.error("Error in getUserEvents controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

export async function updateEventTitle(req, res) {
  try {
    const {eventId} = req.params;
    const {newTitle} = req.body;
    const userId = req.user.id;

    const event = await Event.findByIdAndUpdate(eventId);
    if(!event){
      return res.status(404).json({success: false, message: "Event not found."})
    }

    if (event.organizer.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Only the organizer can edit the title of this event" });
    }

    event.title = newTitle;
    await event.save();
    
    res.status(200).json({success: true, message: "title updated", event});
  } catch (error) {
    console.error("Error in updateEventTitle controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

export async function deleteEvent(req, res) {
  try {
    const { eventId } = req.params;
    const userId= req.user.id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({success: false, message: "Event not found" });

    if (event.organizer.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Only the organizer can delete this event" });
    }

    await User.updateMany(
      { attendingEvents: eventId },
      { $pull: { attendingEvents: eventId } }
    );

    await User.findByIdAndUpdate(event.organizer, {
      $pull: { createdEvents: eventId },
    });

    await Event.findByIdAndDelete(eventId);

    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error in deleteEvent controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

export async function toggleEventStatus(req, res){
  try {
    const {isActive} = req.body;
    const { eventId } = req.params;
    const event = await Event.findByIdAndUpdate(eventId, {isActive}, {new: true});
    if(!event){
      return res.status(404).json({success: false, message: "Event not found."});
    }

    res.status(200).json({success: true, message: `Event ${isActive ? "activated" : "deactivated"}`, event })
  } catch (error) {
    console.error("Error in toggleEventStatus controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

export async function copyEventLink(req, res){
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.json({ sucess: true, eventLink: event.eventLink, ...(event.password && { password: event.password })});
  } catch (error) {
    console.error("Error in copyEventLink controller:", error.message);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
}

export async function getUserById(req,res){
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("firstName lastName photoUrl");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ success: false, message: "Internal Server error" });
  }
}