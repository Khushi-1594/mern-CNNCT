import Event from "../models/events.js";
import { toZonedTime, format as formatTZ } from "date-fns-tz";

export async function getUpcomingEvents(req, res) {
  try {
    const userId = req.user.id;
    const userTimeZone = req.query.timezone || "UTC";
    const currentDateTime = new Date();

    const upcomingEvents = await Event.find({
      $or: [{ "participants.user": userId }, { organizer: userId }],
      date: { $gte: currentDateTime },
    }).sort({ date: 1 });

    const formattedEvents = upcomingEvents.map((event) => {
      const localDate = toZonedTime(event.date, userTimeZone);
      const formattedDate = formatTZ(localDate, "EEEE, d MMM", {
        timeZone: userTimeZone,
      });
      const formattedTime = `${formatTZ(localDate, "hh:mm a", {
        timeZone: userTimeZone,
      })} - ${formatTZ(
        toZonedTime(
          new Date(event.date.getTime() + event.duration * 3600000),
          userTimeZone
        ),
        "hh:mm a",
        { timeZone: userTimeZone }
      )}`;

      return {
        ...event.toObject(),
        formattedDate,
        formattedTime,
      };
    });

    res.status(200).json({ success: true, upcomingEvents: formattedEvents });
  } catch (error) {
    console.error("Error in getUpcomingEvents controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

//Get pending events
export async function getPendingEvents(req, res) {
  try {
    const userId = req.user.id;
    const userTimeZone = req.query.timezone || "UTC";

    const pendingEvents = await Event.find({
      participants: {
        $elemMatch: { user: userId, status: "pending" },
      },
      organizer: { $ne: userId },
    }).sort({ date: -1 });

    const formattedEvents = pendingEvents.map((event) => {
      const localDate = toZonedTime(event.date, userTimeZone);
      const formattedDate = formatTZ(localDate, "EEEE, d MMM", {
        timeZone: userTimeZone,
      });
      const formattedTime = `${formatTZ(localDate, "hh:mm a", {
        timeZone: userTimeZone,
      })} - ${formatTZ(
        toZonedTime(
          new Date(event.date.getTime() + event.duration * 3600000),
          userTimeZone
        ),
        "hh:mm a",
        { timeZone: userTimeZone }
      )}`;

      return {
        ...event.toObject(),
        formattedDate,
        formattedTime,
      };
    });

    res.status(200).json({ success: true, pendingEvents: formattedEvents });
  } catch (error) {
    console.log("Error in getPendingEvents controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// Get Canceled Events
export async function getCanceledEvents(req, res) {
  try {
    const userId = req.user.id;
    const userTimeZone = req.query.timezone || "UTC";

    const canceledEvents = await Event.find({
      participants: {
        $elemMatch: { user: userId, status: "rejected" },
      },
      organizer: { $ne: userId },
    }).sort({ date: -1 });
    const formattedEvents = canceledEvents.map((event) => {
      const localDate = toZonedTime(event.date, userTimeZone);
      const formattedDate = formatTZ(localDate, "EEEE, d MMM", {
        timeZone: userTimeZone,
      });
      const formattedTime = `${formatTZ(localDate, "hh:mm a", {
        timeZone: userTimeZone,
      })} - ${formatTZ(
        toZonedTime(
          new Date(event.date.getTime() + event.duration * 3600000),
          userTimeZone
        ),
        "hh:mm a",
        { timeZone: userTimeZone }
      )}`;

      return {
        ...event.toObject(),
        formattedDate,
        formattedTime,
      };
    });

    res.status(200).json({ success: true, canceledEvents: formattedEvents });
  } catch (error) {
    console.log("Error in getCanceledEvents controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

//  Get Past Events
export async function getPastEvents(req, res) {
  try {
    const userId = req.user.id;
    const userTimeZone = req.query.timezone || "UTC";
    const currentDateTime = new Date();

    const pastEvents = await Event.find({
      $or: [{ "participants.user": userId }, { organizer: userId }],
      date: { $lt: currentDateTime },
    }).sort({ date: -1 });

    const formattedEvents = pastEvents.map((event) => {
      const localDate = toZonedTime(event.date, userTimeZone);
      const formattedDate = formatTZ(localDate, "EEEE, d MMM", {
        timeZone: userTimeZone,
      });
      const formattedTime = `${formatTZ(localDate, "hh:mm a", {
        timeZone: userTimeZone,
      })} - ${formatTZ(
        toZonedTime(
          new Date(event.date.getTime() + event.duration * 3600000),
          userTimeZone
        ),
        "hh:mm a",
        { timeZone: userTimeZone }
      )}`;

      return {
        ...event.toObject(),
        formattedDate,
        formattedTime,
      };
    });

    res.status(200).json({ success: true, pastEvents: formattedEvents });
  } catch (error) {
    console.log("Error in pastEvents controller", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

//accept event request
export async function acceptEventRequest(req, res) {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    let event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() === userId.toString()) {
      return res
        .status(403)
        .json({ message: "Organizer cannot accept the event" });
    }

    let participant = event.participants.find(
      (p) => p.user.toString() === userId.toString()
    );
    if (!participant) {
      return res
        .status(403)
        .json({ message: "You are not a participant of this event" });
    }

    if (participant.status !== "pending") {
      return res
        .status(400)
        .json({ message: `You have already ${participant.status} this event` });
    }

    participant.status = "accepted";

    await event.save();
    res.status(200).json({ message: "Event accepted successfully", event });
  } catch (error) {
    console.log("Error in acceptEventRequest controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// Reject Event Request
export async function rejectEventRequest(req, res) {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    let event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() === userId.toString()) {
      return res
        .status(403)
        .json({ message: "Organizer cannot reject the event" });
    }

    let participant = event.participants.find(
      (p) => p.user.toString() === userId.toString()
    );
    if (!participant) {
      return res
        .status(403)
        .json({ message: "You are not a participant of this event" });
    }

    if (participant.status !== "pending") {
      return res
        .status(400)
        .json({ message: `You have already ${participant.status} this event` });
    }

    participant.status = "rejected";

    await event.save();
    res.status(200).json({ message: "Event rejected successfully", event });
  } catch (error) {
    console.log("Error in rejectEventRequest controller:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}
