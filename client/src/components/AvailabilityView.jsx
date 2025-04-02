import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, startOfWeek, addDays } from "date-fns";
import { showErrorToast, showSuccessToast } from "../pages/toastUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AvailabilityView = ({ userTimezone }) => {
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    const today = new Date();
    const startDate = startOfWeek(today, { weekStartsOn: 1 }); // Ensure the week starts on Monday

    const weekAvailability = Array.from({ length: 7 }, (_, index) => {
      const currentDate = addDays(startDate, index);
      return {
        day: format(currentDate, "EEE"), // Short day name
        date: format(currentDate, "yyyy-MM-dd"),
        isChecked: index !== 6, // Disable Sunday by default
        slots: index !== 6 ? [{ startTime: "", endTime: "" }] : [],
      };
    });

    setAvailability(weekAvailability);
  }, []);

  const handleCheckboxChange = (day) => {
    setAvailability((prev) =>
      prev.map((d) => {
        const isChecked = !d.isChecked;
        const newSlots = isChecked
          ? [{ startTime: "00:00", endTime: "23:59" }]
          : [];
        return d.day === day ? { ...d, isChecked, slots: newSlots } : d;
      })
    );
  };

  const handleAddSlot = (day) => {
    setAvailability((prev) =>
      prev.map((d) =>
        d.day === day && d.isChecked
          ? { ...d, slots: [...d.slots, { startTime: "", endTime: "" }] }
          : d
      )
    );
  };

  const handleSlotChange = (day, index, field, value) => {
    setAvailability((prev) =>
      prev.map((d) =>
        d.day === day
          ? {
              ...d,
              slots: d.slots.map((slot, i) =>
                i === index ? { ...slot, [field]: value } : slot
              ),
            }
          : d
      )
    );
  };

  const handleDeleteSlot = (day, index) => {
    setAvailability((prev) =>
      prev.map((d) =>
        d.day === day
          ? { ...d, slots: d.slots.filter((_, i) => i !== index) }
          : d
      )
    );
  };

  const handleSave = async () => {
    const formattedAvailability = availability
      .filter((d) => d.isChecked)
      .map((d) => {
        const hasValidSlots = d.slots.some(
          (slot) => slot.startTime && slot.endTime
        );

        return {
          day: format(new Date(d.date), "EEEE"),
          date: format(new Date(d.date), "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
          slots: hasValidSlots
            ? d.slots.filter((slot) => slot.startTime && slot.endTime)
            : [{ startTime: "00:00", endTime: "23:59" }],
        };
      });
      
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/availability/set-availability`,
        { availability: formattedAvailability, userTimezone },
        { withCredentials: true }
      );
      showSuccessToast("Availability updated successfully!");
    } catch (error) {
      console.error("Error saving availability:", error);
      showErrorToast("Failed to update availability. Please try again.");
    }
  };

  return (
    <div className="availability-container">
      <p>Weekly hours</p>
      {availability.map(({ day, date, isChecked, slots }) => (
        <div key={day} className="day-row">
          <div className="day-row-start">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleCheckboxChange(day)}
            />
            <label>{day}</label>
            {!isChecked && (
              <span className="unavailable-text">Unavailable</span>
            )}
          </div>
          {isChecked && (
            <div className="slots-container">
              {slots.map((slot, index) => (
                <div key={index} className="slot-row">
                  <input
                    type="text"
                    value={slot.startTime}
                    onChange={(e) =>
                      handleSlotChange(day, index, "startTime", e.target.value)
                    }
                  />
                  <span>-</span>
                  <input
                    type="text"
                    value={slot.endTime}
                    onChange={(e) =>
                      handleSlotChange(day, index, "endTime", e.target.value)
                    }
                  />
                  <button onClick={() => handleDeleteSlot(day, index)}>
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="add-btn">
            <button onClick={() => handleAddSlot(day)} className="add-slot-btn">
              +
            </button>
          </div>
        </div>
      ))}
      <button onClick={handleSave} className="save-button">
        Save Availability
      </button>
    </div>
  );
};

export default AvailabilityView;
