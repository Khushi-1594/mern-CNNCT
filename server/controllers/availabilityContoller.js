import User from "../models/user.js";
import Event from "../models/events.js";
import { toZonedTime, fromZonedTime, format as formatTZ } from "date-fns-tz";
import { format, parseISO } from "date-fns";

// Add or update availability
export async function setAvailability(req, res) {
  try {
    const userId = req.user.id;
    let { availability } = req.body;
    const userTimezone = req.body.userTimezone?.value || req.body.userTimezone;

    if (!Array.isArray(availability) || !userTimezone) {
      return res.status(400).json({
        message: "Invalid availability data or missing user's time zone.",
      });
    }

    // Convert date/time to UTC before storing
    availability = availability.map((entry) => {
      return {
        ...entry,
        date: format(
          fromZonedTime(parseISO(entry.date), userTimezone),
          "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        ),
        slots: entry.isChecked && entry.slots.length === 0 ?[{ startTime: "00:00", endTime: "23:59" }] : entry.slots,
      };
    });

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const duplicateSlots = [];
    let isUpdated = false; // Flag to check if any new slots were added

    availability.forEach((newEntry) => {
      const formattedNewDate = format(new Date(newEntry.date), "yyyy-MM-dd");

      const existingEntryIndex = user.availability.findIndex(
        (a) => format(new Date(a.date), "yyyy-MM-dd") === formattedNewDate
      );

      if (existingEntryIndex !== -1) {
        const existingEntry = user.availability[existingEntryIndex];
        if (
          newEntry.slots.length === 1 &&
          newEntry.slots[0].startTime === "00:00" &&
          newEntry.slots[0].endTime === "23:59"
        ) {
          console.log(`Ignoring full-day availability for ${newEntry.day}`);
        } else {
          if (
            existingEntry.slots.length === 1 &&
            existingEntry.slots[0].startTime === "00:00" &&
            existingEntry.slots[0].endTime === "23:59"
          ) {
            user.availability[existingEntryIndex].slots = newEntry.slots;
            isUpdated = true;
          } else {
            const filteredSlots = newEntry.slots.filter((newSlot) => {
              const isDuplicate = existingEntry.slots.some(
                (slot) =>
                  slot.startTime === newSlot.startTime &&
                  slot.endTime === newSlot.endTime
              );
      
              if (isDuplicate) {
                duplicateSlots.push(
                  `${newEntry.day} (${newSlot.startTime} - ${newSlot.endTime})`
                );
              }
      
              return !isDuplicate;
            });
      
            if (filteredSlots.length > 0) {
              existingEntry.slots.push(...filteredSlots);
              isUpdated = true;
            }
          }
        }
      } else {
        user.availability.push(newEntry);
        isUpdated = true;
      }
      
    });

    if (duplicateSlots.length > 0 && !isUpdated) {
      return res.status(400).json({
        message: `All slots already exist: ${duplicateSlots.join(
          ", "
        )}. No changes were made.`,
      });
    }

    await user.save();

    return res.status(200).json({
      message: isUpdated
        ? "Availability updated successfully"
        : "No new slots added.",
      availability: user.availability,
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}

export async function getCalendarMeetings(req, res) {
  try {
    const userId = req.user.id;
    const userTimeZone = req.query.timezone || "UTC";
    const { searchQuery } = req.query;

    const filter = {
      $or: [{ "participants.user": userId }, { organizer: userId }],
    };

    if (searchQuery) {
      filter.title = { $regex: searchQuery, $options: "i" };
    }

    const meetings = await Event.find(filter).sort({ date: 1 });

    const formattedMeetings = meetings.map((event) => {
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

    res.status(200).json({ success: true, meetings: formattedMeetings });
  } catch (error) {
    console.error("Error fetching meetings:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
}
