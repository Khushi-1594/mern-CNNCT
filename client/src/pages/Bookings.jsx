import axios from "axios";
import React, { useEffect, useState } from "react";
import { Users, Check, Ban } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import "../styles/dashboard.css";
import toast from "react-hot-toast";
import { showErrorToast, showSuccessToast } from "./toastUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Bookings = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [events, setEvents] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [showParticipantsList, setShowParticipantsList] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) fetchEvents(activeTab);
  }, [activeTab, user]);

  const fetchEvents = async (type) => {
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await axios.get(`${API_BASE_URL}/api/bookings/${type}`, {
        params: { timezone: userTimezone },
        withCredentials: true,
      });
      setEvents(res.data[`${type}Events`] || []);

      // Fetch user details for all participants
      const allParticipants = res.data[`${type}Events`].flatMap(
        (event) => event.participants
      );
      fetchUserDetails(allParticipants);
    } catch (error) {
      console.error(`Error fetching ${type} events:`, error);
    }
  };

  const fetchUserDetails = async (participants) => {
    const uniqueUserIds = [...new Set(participants.map((p) => p.user))];
    try {
      const userResponses = await Promise.all(
        uniqueUserIds.map((id) =>
          axios.get(`${API_BASE_URL}/api/events/user/${id}`, {
            withCredentials: true,
          })
        )
      );

      const userData = {};
      userResponses.forEach((res) => {
        userData[res.data._id] = res.data;
      });

      setUserDetails(userData);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleAccept = async (eventId, userId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/bookings/accept/${eventId}`,
        { userId },
        { withCredentials: true }
      );
      showSuccessToast("Booking accepted successfully");
      fetchEvents(activeTab);
    } catch (error) {
      console.error("Error accepting booking:", error);
      showErrorToast("Failed to accept booking");
    }
  };

  const handleReject = async (eventId, userId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/bookings/reject/${eventId}`,
        { userId },
        { withCredentials: true }
      );
      showSuccessToast("Booking rejected successfully");
      fetchEvents(activeTab);
    } catch (error) {
      console.error("Error rejecting booking:", error);
      showErrorToast("Failed to reject booking");
    }
  };

  return (
    <div className="dash-right-side">
      <div className="cont1-left">
        <h2 className="dashboard-title">Booking</h2>
        <p className="bookings-p">
          See upcoming and past events booked through your event type links.
        </p>
      </div>

      <div className="bookings-container">
        <div className="tabs">
          {["upcoming", "pending", "canceled", "past"].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <hr />

        {/* Events List */}
        <div className="events-list">
          {events.length === 0 ? (
            <p className="no-event-list">No {activeTab} events found.</p>
          ) : (
            events.map((event) => {
              const participant = event.participants.find(
                (p) => p.user === user?._id
              );
              const participantStatus = participant
                ? participant.status
                : "unknown";

              return (
                <div key={event._id} className="bookings-card">
                  <div className="event-date">
                    <p className="date">{event.formattedDate}</p>
                    <p className="time">{event.formattedTime}</p>
                  </div>
                  <div className="event-info">
                    <p className="title">{event.title}</p>
                    <p>You and {event.participants.length - 1} others</p>
                  </div>
                  <div className="event-status">
                    {participantStatus === "pending" ? (
                      <div className="pending-buttons">
                        <button className="reject-btn"  onClick={() => handleReject(event._id, user?._id)}>
                          <Ban size={20} />
                          Reject
                        </button>
                        <button className="accept-btn"  onClick={() => handleAccept(event._id, user?._id)}>
                          <Check size={20} />
                          Accept
                        </button>
                      </div>
                    ) : (
                      <button className={`status ${participantStatus}`}>
                        {participantStatus.charAt(0).toUpperCase() +
                          participantStatus.slice(1)}
                      </button>
                    )}
                  </div>
                  <div className="participants">
                    <Users size={18} />
                    {event.participants.length} people
                    <div className="participants-list">
                      <div className="list-start">
                        <p>Participant</p>
                        <p className="p-length">({event.participants.length})</p>
                      </div>
                      <div className="list-container">
                        <ul className="participant-list">
                          {event.participants.map((participant, index) => {
                            const userData = userDetails[participant.user]; // Get user data
                            return (
                              <li key={index} className="participant-item">
                                <div className="profile">
                                  {userData?.photoUrl ? (
                                    <img
                                      src={userData.photoUrl}
                                      alt={userData.firstName}
                                      className="avatar"
                                    />
                                  ) : (
                                    <div className="avatar-placeholder">
                                      {userData?.firstName?.charAt(0)}
                                      {userData?.lastName?.charAt(0)}
                                    </div>
                                  )}
                                  <span>
                                    {userData
                                      ? `${userData.firstName} ${userData.lastName}`
                                      : "Loading..."}
                                  </span>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={participant.status === "accepted"}
                                  readOnly
                                />
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookings;
