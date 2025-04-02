import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import image from "../assets/image1.png";
import logo from "../assets/logo.png";
import "../styles/style1.css";
import { showErrorToast } from "./toastUtils";

const SignupPage1 = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useAuthStore();
  const [data, setData] = useState({
    firstName: signupData.firstName || "",
    lastName: signupData.lastName || "",
    email: signupData.email || "",
    password: signupData.password || "",
    confirmPassword: signupData.confirmPassword || "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!data.firstName || !data.lastName || !data.password) {
      showErrorToast("All field are required.");
      return;
    }
    if (data.password.length < 6) {
      showErrorToast("Password must be atleast 6 characters long");
      return;
    }
    if (data.password !== data.confirmPassword) {
      showErrorToast("Passwords do not match");
      return;
    }
    setSignupData(data);
    navigate("/preferences");
  };

  return (
    <>
      <div className="main-container">
        <div className="left-side">
          <div className="signup-logo">
            <img src={logo} alt="logo" />
          </div>
          <div className="left-side-form">
            <div className="form-start">
              <p>Create an account</p>
              <div className="navigate-link">
                <Link to={"/login"}>Sign in instead</Link>
              </div>
            </div>

            <form onSubmit={handleNext} className="signup-form">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={data.firstName}
                onChange={handleChange}
              />

              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={data.lastName}
                onChange={handleChange}
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                value={data.email}
                onChange={handleChange}
              />

              <label>Password</label>
              <input
                type="password"
                name="password"
                value={data.password}
                onChange={handleChange}
              />

              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={handleChange}
              />

              <div className="terms">
                <input type="checkbox" required />
                <span className="terms-conditions">
                  By creating an account, I agree to our{" "}
                  <a href="#">terms of use</a> and{" "}
                  <a href="#">privacy policy</a>.
                </span>
              </div>
              <button
                type="submit"
                className={`signup-btn ${
                  !(
                    data.firstName &&
                    data.lastName &&
                    data.email &&
                    data.password &&
                    data.confirmPassword
                  )
                    ? "disabled"
                    : ""
                }`}
                disabled={
                  !(
                    data.firstName &&
                    data.lastName &&
                    data.email &&
                    data.password &&
                    data.confirmPassword
                  )
                }
              >
                Next
              </button>
            </form>
          </div>
          {/* <div>
            <p>This site is protected by reCAPTCHA and the</p>
          </div> */}
        </div>

        <div className="right-side-image">
          <img src={image} alt="Login Visual" className="image-fit" />
        </div>
      </div>
    </>
  );
};

export default SignupPage1;
