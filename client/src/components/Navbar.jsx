import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore';
import { LogOut, Calendar, Clock, Settings, Link, Turtle, Plus } from "lucide-react";
import logo from '../assets/logo.png'
import '../styles/navbar.css'

const Navbar = () => {
    const navigate = useNavigate();
    const {user, logout} = useAuthStore();
    const [showLogout, setShowLogout] = useState(false);
    const [userData, setUserData] = useState(user);

    useEffect(() => {
        if(user){
            setUserData(user);
        }
    }, [user]);

    const firstName = userData.firstName || "";
    const lastName = userData.lastName || "";
    const profilePicture =  userData?.photoUrl;

    if(!user) return null;

    const nameInitials = firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() : "U";

    const handleLogout = async () => {
      await logout(); 
      navigate("/", {replace: true});
    };

  return (
    <div className='sidebar'>
      <div className="logo">
        <img src={logo} alt="logo" />
      </div>
      <nav className='nav-links'>
        <NavLink to="/dashboard/events" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}> <Link size={20} /> Events</NavLink>
        <NavLink to="/dashboard/bookings" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}> <Calendar size={20} /> Bookings</NavLink>
        <NavLink to="/dashboard/availability" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}> <Clock size={20} /> Availability</NavLink>
        <NavLink to="/dashboard/settings" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}> <Settings size={20} /> Settings</NavLink>
      </nav>
      <button className='create-btn' onClick={() => navigate("/dashboard/create-event")}><Plus size={20} />Create</button>

      <div className='profile-section' onMouseEnter={() => setShowLogout(true)} onMouseLeave={() => setShowLogout(false)}>
        {profilePicture ? (
            <img src={profilePicture} alt='profile' className='profile-pic'></img>
        ) : (
            <div className='profile-initials'>{nameInitials}</div>
        )}
        <span className='user-name'>{`${firstName} ${lastName}`}</span>

        {showLogout && (
            <button className='signout-btn' onClick={handleLogout}>
                <LogOut size={16} />
                Sign Out
            </button>
        )}
      </div>
    </div>
  );
}

export default Navbar