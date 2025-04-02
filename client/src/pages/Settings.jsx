import React, { useEffect, useState } from 'react'
import "../styles/dashboard.css"
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showErrorToast, showInfoToast, showSuccessToast } from './toastUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Settings = () => {
    const {user, updateUser, logout} = useAuthStore();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        photoUrl: "",
      });

      useEffect(() => {
        if (user) {
          setFormData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            password: "",
            confirmPassword: "",
            photoUrl: user.photoUrl || "",
          });
        }
      }, [user]);

      const handleChange = (e) => {
        const { name, value } = e.target;
  
        setFormData((prev) => {
          return { ...prev, [name]: value };
        });
      };

      const handleSave = async () => {
        if (formData.password && formData.password !== formData.confirmPassword) {
          showErrorToast("Passwords do not match!");
          return;
        }
      
        const updatedData = {};

        if (formData.firstName !== user.firstName) updatedData.firstName = formData.firstName;
        if (formData.lastName !== user.lastName) updatedData.lastName = formData.lastName;
        if (formData.email !== user.email) updatedData.email = formData.email;
        if (formData.password) updatedData.password = formData.password;
        if (formData.photoUrl !== user.photoUrl) updatedData.photoUrl = formData.photoUrl;

        if (Object.keys(updatedData).length === 0) {
          showInfoToast("No changes made!");
          return;
        }
    
        try {
          const res = await axios.put(`${API_BASE_URL}/api/settings/updateProfile`, updatedData, { withCredentials: true });
    
          if (res.data.shouldLogout) {
            showSuccessToast("Email or password updated! Logging out...");
            await logout();
            navigate("/")
          } else {
            showSuccessToast("Profile updated successfully!");
            updateUser(res.data.user); 
            navigate("/dashboard", { replace: true });
          }
        } catch (error) {
          console.error("Error updating profile:", error);
          if (error.response && error.response.data && error.response.data.message) {
            showErrorToast(error.response.data.message);
        } else {
            showErrorToast("Failed to update profile.");
        }
        }
      };

  return (
    <div className="dash-right-side">
      <div className="cont1-left settings-cont-left">
        <h2 className="dashboard-title">Profile</h2>
        <p>Manage settings for your profile</p>
      </div>
      <div className="settings-container">
      <p className='edit-tab active'>Edit Profile</p>
      <hr></hr>
        <div className="form-group">
          <label>First Name</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Profile Picture URL</label>
          <input type="text" name="photoUrl" value={formData.photoUrl} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
        </div>

        <button className="save-btn" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}

export default Settings