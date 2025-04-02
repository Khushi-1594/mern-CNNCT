import React from "react";
import screen2 from "../assets/screen2.png";
import screen3 from "../assets/screen3.png";
import "../styles/homeStyle.css";

const HomeComponent2 = () => {
  return (
    <div className="container-3">
      <div className="cont3-left-side">
        <h2>Stay Organized With Your Calender & Meetings</h2>
        <p>Seamless Event Scheduling</p>
        <ul>
          <li>
            View all your upcoming meetings and appointments in one place.
          </li>
          <li>
            Syncs with Google Calendar, Outlook, and iCloud to avoid conflicts.
          </li>
          <li>
            Customize event types: one-on-ones, team meetings, group sessions,
            and webinars.
          </li>
        </ul>
      </div>
      <div className="cont3-right-side">
        <img src={screen2} alt="screen2" className="screen2" />
        <img src={screen3} alt="screen3" className="screen3" />
      </div>
    </div>
  );
};

export default HomeComponent2;
