import { useState, useEffect, useRef } from "react";
import {
  Copy,
  ToggleLeft,
  ToggleRight,
  Plus,
  PencilLine,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "./toastUtils";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [editingEventId, setEditingEventId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const titleInputRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await axios.get(`${API_BASE_URL}/api/events/user-events`, {
        params: { timezone: userTimezone },
        withCredentials: true,
      });
      setEvents(res.data.events);
    } catch (error) {
      console.log("Error in fetching events:", error);
      showErrorToast(error.response.data.message || "Failed to fetch the events.");
    }
  };

  const handleEditTitle = async (eventId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/events/update-title/${eventId}`,
        { newTitle: editedTitle },
        { withCredentials: true }
      );
      setEditingEventId(null);
      fetchEvents();
      showSuccessToast("Event title updated successfully");
    } catch (error) {
      showErrorToast("Failed to update event title");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/events/delete/${eventId}`, {
        withCredentials: true,
      });
      fetchEvents();
      showSuccessToast("Event deleted successfully");
    } catch (error) {
      showErrorToast("Failed to delete event");
    }
  };

  const handleCopyLink = async (eventId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/events/event-link/${eventId}`,
        {
          withCredentials: true,
        }
      );

      const eventLink = res.data.eventLink;
      if (!eventLink) throw new Error("Event link not found");

      let clipboardText = eventLink;
      if (res.data.password) {
        clipboardText += `\nPassword: ${res.data.password}`;
      }

      await navigator.clipboard.writeText(clipboardText);
      showSuccessToast("Event link copied to clipboard");
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Failed to copy event link");
    }
  };

  const toggleEventStatus = async (eventId, isActive) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/events/toggle-status/${eventId}`,
        { isActive: !isActive },
        { withCredentials: true }
      );
      fetchEvents();
      showSuccessToast("Event status updated");
    } catch (error) {
      console.log(error.message);
      showErrorToast("Failed to update event status");
    }
  };

  return (
    <div className="dash-right-side">
      <div className="dash-container1">
        <div className="cont1-left">
          <h2 className="dashboard-title">Event Types</h2>
          <p>Create events to share for people to book on your calendar.</p>
          <p>New</p>
        </div>
        <button
          className="create-event-btn"
          onClick={() => navigate("/dashboard/create-event")}
        >
          <Plus size={16} />
          Add New Event
        </button>
      </div>
      <div className="events-grid">
        {events.map((event) => (
          <div
            key={event._id}
            className={`event-card ${event.isActive ? "active" : ""}`}
          >
            {/* Conflict indicator */}
            {event.hasConflict && (
              <div className="conflict-indicator">
               <div className="conflict-dot">!
               <span className="conflict-text">Conflict of timing</span>
               </div>
              </div>
            )}
            {editingEventId === event._id ? (
              <div className="edit-title-input title">
              <input
              ref={titleInputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={() => handleEditTitle(event._id)}
                onKeyDown={(e) => {
                  if(e.key === "Enter"){
                    handleEditTitle(event._id);
                  }
                }}
                autoFocus
              />

              <PencilLine />
              </div>
            ) : (
              <p className="title">
                {event.title}{" "}
                <PencilLine
                  onClick={() => {
                    setEditingEventId(event._id);
                    setEditedTitle(event.title);
                  }}
                />
              </p>
            )}
            <div className="event-details">
              <p className="date">{event.formattedDate}</p>
              <p className="time">{event.formattedTime}</p>
              <p className="duration">{event.duration}hr, Group Meeting</p>
            </div>
            <hr></hr>
            <div className="event-actions">
              <button
                className={`toggle-btn ${event.isActive ? "active" : "inactive"}`}
                onClick={() => toggleEventStatus(event._id, event.isActive)}
              >
              {console.log(event.isActive)}
                {event.isActive ? <ToggleRight /> : <ToggleLeft />}
              </button>
              <Copy onClick={() => handleCopyLink(event._id)} />
              <Trash2 onClick={() => handleDeleteEvent(event._id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
