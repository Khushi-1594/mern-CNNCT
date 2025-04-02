import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import "../styles/dashboard.css";
import Select from "react-select";
import TimezoneSelect from "react-timezone-select";
import { format, parse, parseISO } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import toast from "react-hot-toast";
import axios from "axios";
import { PencilLine, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast, showWarningToast } from "./toastUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CreateEvent = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef(null);
  const [emailList, setEmailList] = useState([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [eventData, setEventData] = useState({
    eventTopic: "",
    password: "",
    hostName: user ? `${user.firstName} ${user.lastName}` : "",
    description: "",
    date: "",
    time: "",
    period: "AM",
    duration: "1 hour",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    banner: "",
    backgroundColor: "#3e2723",
    link: "",
    emails: "",
    photoUrl: user?.photoUrl || "",
  });

  const [selectedTimeOption, setSelectedTimeOption] = useState(null);
  const [selectedPeriodOption, setSelectedPeriodOption] = useState({
    label: "AM",
    value: "AM",
  });
  const [selectedDurationOption, setSelectedDurationOption] = useState({
    label: "1 hour",
    value: "1",
  });

  const predefinedColors = [
    { color: "#ff5722", label: "Orange" },
    { color: "#ffffff", label: "White" },
    { color: "#000000", label: "Black" },
  ];

  const timeOptions = [];
  for (let h = 1; h <= 12; h++) {
    ["00", "30"].forEach((m) => {
      timeOptions.push({
        label: `${h.toString().padStart(2, "0")}:${m}`,
        value: `${h}:${m}`,
      });
    });
  }

  const periodOptions = [
    { label: "AM", value: "AM" },
    { label: "PM", value: "PM" },
  ];

  const durationOptions = [
    { label: "1 hour", value: "1" },
    { label: "2 hours", value: "2" },
    { label: "3 hours", value: "3" },
    { label: "4 hours", value: "4" },
  ];

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const handleSelectChange = (selectedOption, field) => {
    setEventData({ ...eventData, [field]: selectedOption.value });

    // Also update the corresponding state for UI selection
    if (field === "time") {
      setSelectedTimeOption(selectedOption);
    } else if (field === "period") {
      setSelectedPeriodOption(selectedOption);
    } else if (field === "duration") {
      setSelectedDurationOption(selectedOption);
    }
  };

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (
      !eventData.eventTopic ||
      !eventData.hostName ||
      !eventData.date ||
      !eventData.time ||
      !eventData.timezone
    ) {
      showErrorToast("All field are required.");
      return;
    }
    setStep(2);
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const handleColorSelect = (color) => {
    setEventData({ ...eventData, backgroundColor: color });
  };

  const toggleTitleEdit = () => {
    setIsEditingTitle(!isEditingTitle);
  };

  const handleTitleChange = (e) => {
    setEventData({ ...eventData, eventTopic: e.target.value });
  };

  const saveTitle = () => {
    setIsEditingTitle(false);
    showSuccessToast("Event title updated!!");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      saveTitle();
    }
  };

  const handleEmailChange = (e) => {
    setCurrentEmail(e.target.value);
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail();
    }
  };

  const addEmail = () => {
    const trimmedEmail = currentEmail.trim();
    if (trimmedEmail && !emailList.includes(trimmedEmail)) {
      const updatedList = [...emailList, trimmedEmail];
      setEmailList(updatedList);
      setCurrentEmail("");
      setEventData({ ...eventData, emails: updatedList.join(",") });
    }
  };

  const removeEmail = (emailToRemove) => {
    const updatedList = emailList.filter((email) => email !== emailToRemove);
    setEmailList(updatedList);
    setEventData({ ...eventData, emails: updatedList.join(",") });
  };

  const handleErrors = (error) => {
    const errorCode = error.response?.data?.code;
    console.log(errorCode);

  switch (errorCode) {
    case "USER_NOT_AVAILABLE":
      showErrorToast("You are not available at this time.");
      break;
    case "ORGANIZER_CONFLICT":
      showErrorToast("You are already hosting another event at this time.");
      break;
    case "INVALID_EMAIL":
      showErrorToast("One or more participant emails are invalid. Please check again.");
      break;
    case "ORGANIZER_EMAIL":
      showErrorToast("You cannot add yourself as a participant.");
      break;
    default:
      showErrorToast("Error creating event.");
  }
  };
  

  const handleSave = async () => {
    try {
      if (!eventData.link || !eventData.emails.length===0) {
        showErrorToast("All field are required.");
        return;
      }
      const selectedDate = eventData.date;
      const selectedTime = eventData.time;
      const selectedPeriod = eventData.period;
      const userTimeZone = eventData.timezone;

      let [hours, minutes] = selectedTime.split(":").map(Number);
      if (selectedPeriod === "PM" && hours !== 12) hours += 12;
      if (selectedPeriod === "AM" && hours === 12) hours = 0;

      const localDateTimeString = `${selectedDate}T${hours
        .toString()
        .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;

      // Parse as local time
      const localDateTime = new Date(localDateTimeString);

      // Convert to UTC
      const eventDateTimeUTC = fromZonedTime(localDateTime, userTimeZone);

      const payload = {
        title: eventData.eventTopic,
        description: eventData.description,
        date: eventDateTimeUTC.toISOString(),
        duration: parseInt(eventData.duration),
        participants: emailList,
        eventLink: eventData.link,
        password: eventData.password,
        timezone: userTimeZone,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/events/create-event`,
        payload,
        { withCredentials: true }
      );

      if (response.data.conflicts && response.data.conflicts.length > 0) {
        showWarningToast("Warning: Event conflicts with existing schedule.");
      }

      if (response.status === 201) {
        showSuccessToast("Event created successfully!");
      }
      navigate("/dashboard");
    } catch (error) {
      handleErrors(error);
    }
  };

  return (
    <div className="event-creation-container">
      <div className="cont1-left event-form-cont-left">
        <h2 className="dashboard-title">Create Event</h2>
        <p>Create events to share for people to book on your calendar.</p>
        <p>New</p>
      </div>

      {step === 1 ? (
        <div className="step-1">
          <h2>Add Event</h2>
          <hr></hr>
          <form className="event-form">
            <div className="form-field">
              <label>
                Event Topic <span className="required">*</span>
              </label>
              <input
                type="text"
                value={eventData.eventTopic}
                name="eventTopic"
                placeholder="Set a conference topic before it starts"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={eventData.password}
                placeholder="Password"
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>
                Host Name<span className="required">*</span>
              </label>
              <input name="hostName" value={eventData.hostName} readOnly />
            </div>

            <div className="form-field">
              <label>Description</label>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleChange}
              />
            </div>

            <hr />

            <div className="datetime-fields">
              <label>
                Date and Time <span className="required">*</span>
              </label>
              <div className="time-fields">
              <input
                name="date"
                type="date"
                value={eventData.date}
                onChange={handleChange}
                required
              />
              <Select
                options={timeOptions}
                value={selectedTimeOption}
                onChange={(e) => handleSelectChange(e, "time")}
              />
              <Select
                options={periodOptions}
                value={selectedPeriodOption}
                onChange={(e) => handleSelectChange(e, "period")}
              />
              <TimezoneSelect
                value={eventData.timezone}
                onChange={(tz) =>
                  setEventData({ ...eventData, timezone: tz.value })
                }
                className="timezone-select"
              />
              </div>
              
            </div>

            <div className="form-field">
              <label>Set Duration</label>
              <Select
                options={durationOptions}
                value={selectedDurationOption}
                onChange={(e) => handleSelectChange(e, "duration")}
                className="duration-select"
              />
            </div>

            <div className="buttons-container">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button type="button" onClick={handleNext} className="next-btn">
                Next
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="step-2">
          <h2>Add Event</h2>
          <hr></hr>
          <form className="banner-event-form">
            <div className="banner-form-field">
              <label>Banner</label>
              <div
                className="banner-preview"
                style={{ backgroundColor: eventData.backgroundColor }}
              >
                <div className="banner-content">
                  <div className="user-photo">
                    {eventData.photoUrl ? (
                      <img src={eventData.photoUrl} alt="User" />
                    ) : (
                      <div className="initials-avatar">
                        {user?.firstName?.charAt(0).toUpperCase()}
                        {user?.lastName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="event-title-container">
                    {isEditingTitle ? (
                      <div className="event-title-edit">
                        <input
                          ref={titleInputRef}
                          type="text"
                          value={eventData.eventTopic}
                          onChange={handleTitleChange}
                          onBlur={saveTitle}
                          onKeyDown={handleKeyDown}
                        />
                      </div>
                    ) : (
                      <div className="event-title-display">
                        <h3>{eventData.eventTopic}</h3>
                        <button
                          type="button"
                          className="edit-title-btn"
                          onClick={toggleTitleEdit}
                        >
                          <PencilLine size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="color-form-field">
              <label>Custom Background Color</label>
              <div className="color-options">
                {predefinedColors.map((colorObj) => (
                  <button
                    key={colorObj.color}
                    type="button"
                    className={`color-btn ${
                      eventData.backgroundColor === colorObj.color
                        ? "selected"
                        : ""
                    }`}
                    style={{
                      backgroundColor: colorObj.color,
                      border:
                        colorObj.color === "#ffffff"
                          ? "1px solid #ccc"
                          : "none",
                    }}
                    onClick={() => handleColorSelect(colorObj.color)}
                    aria-label={`Select ${colorObj.label} color`}
                  />
                ))}
              </div>
              <div className="color-input-container">
                <div
                  className="color-preview"
                  style={{ backgroundColor: eventData.backgroundColor }}
                />
                <input
                  name="backgroundColor"
                  type="text"
                  value={eventData.backgroundColor}
                  onChange={handleChange}
                  className="color-hex-input"
                />
                <input
                  type="color"
                  value={eventData.backgroundColor}
                  onChange={(e) =>
                    setEventData({
                      ...eventData,
                      backgroundColor: e.target.value,
                    })
                  }
                  className="color-picker"
                />
              </div>
            </div>

            <hr className="step-2-hr"></hr>

            <div className="form-field">
              <label>
                Add Link <span className="required">*</span>
              </label>
              <input
                name="link"
                value={eventData.link}
                placeholder="Enter URL Here"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>
                Add Emails <span className="required">*</span>
              </label>
              <div className="email-input-container">
                <div className="email-chips">
                  {emailList.map((email, index) => (
                    <div key={index} className="email-chip">
                      <span>{email}</span>
                      <button
                        type="button"
                        className="remove-email"
                        onClick={() => removeEmail(email)}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="email"
                  value={currentEmail}
                  onChange={handleEmailChange}
                  onKeyDown={handleEmailKeyDown}
                  onBlur={addEmail}
                  placeholder="Add member Emails"
                  className="email-input"
                />
              </div>
            </div>

            <div className="buttons-container">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="cancel-btn"
              >
                Back
              </button>
              <button type="button" onClick={handleSave} className="save-btn">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateEvent;
