import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import { LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import "../styles/dashboard.css"

const MobileViewHeader = () => {
  const { user, logout } = useAuthStore();
  const [showLogout, setShowLogout] = useState(false);
  const [userData, setUserData] = useState(user);

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  const firstName = userData.firstName || "";
  const lastName = userData.lastName || "";
  const profilePicture = userData?.photoUrl;

  const nameInitials =
    firstName && lastName
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
      : "U";

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };
  return (
    <div className="mobile-view-header">
      <div className="mobile-logo">
        <img src={logo} alt="logo" />
      </div>
      <div
        className="mobile-profile-section"
        onMouseEnter={() => setShowLogout(true)}
        onMouseLeave={() => setShowLogout(false)}
      >
        {profilePicture ? (
          <img src={profilePicture} alt="profile" className="profile-pic"></img>
        ) : (
          <div className="profile-initials">{nameInitials}</div>
        )}

        {showLogout && (
          <button className="signout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileViewHeader;
