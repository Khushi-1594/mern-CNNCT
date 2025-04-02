import React, { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { Link, useNavigate } from 'react-router-dom';
import '../styles/style1.css'
import image from '../assets/image1.png'
import logo from '../assets/logo.png'
import { showErrorToast } from './toastUtils';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    })

    const {login, isLoggingIn} = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name] : e.target.value})
    }

    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        const success = await login({
          username: formData.username,
          password: formData.password,
        });
  
        if(success){
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        const errorCode = error.response?.data?.code;
        console.log(errorCode);
    
        switch (errorCode) {
          case "INVALID_CREDENTIALS":
            showErrorToast("Invalid Credentials. Please try again.");
            break;
          case "INTERNAL_SERVER_ERROR":
            showErrorToast("Internal Server Error. Please try again later.");
            break;
          default:
            showErrorToast("Something went wrong. Please try again.");
        }
      }
      
  };
  return (
    <div className="main-container">
      <div className="left-side">
        <div className="signup-logo">
          <img src={logo} alt="logo" />
        </div>
        <div className="left-side-form">
          <h1>Sign in</h1>
          <form onSubmit={handleLogin} className="login-form">
          <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              placeholder="Username"
              onChange={handleChange}
            />
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              placeholder="Password"
              onChange={handleChange}
            />
            <button
              type="submit"
              disabled={isLoggingIn || !formData.username || !formData.password}
              className={`login-btn ${
                !formData.username || !formData.password ? "disabled" : ""
              }`}
            >
              {isLoggingIn ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="navigate-link">
            Don't an account? <Link to={"/signup"}>Sign up</Link>
          </div>
        </div>
      </div>
      <div className="right-side-image">
        <img src={image} alt="Login Visual" className="image-fit" />
      </div>
    </div>
  );
}

export default LoginPage