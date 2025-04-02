import React from "react";
import screen from "../assets/screen 1.png";
import "../styles/homeStyle.css";
import { useNavigate } from "react-router-dom";

const HomeComponent1 = () => {
  const navigate = useNavigate();
  return (
    <div>
      {/*div1*/}
      <div className="container-1">
        <h3 className="moto">CNNCT - EASY </h3>
        <h3>Scheduling Ahead</h3>
        <button className="home-signup-btn" onClick={() => navigate("/signup")}>Sign up free</button>
        <img src={screen} alt="screen" className="screen-img" />
      </div>

      {/*div2*/}
      <div className="container-2">
        <h2>Simplified scheduling for you and your team</h2>
        <p>
          CNNCT eliminates the back-and-forth of scheduling meetings so you can
          focus on what matters. Set your availability, share your link, and let
          others book time with you instantly.
        </p>
      </div>
    </div>
  );
};

export default HomeComponent1;
