import React from "react";
import logo from "../assets/logo.png";
import HomeComponent1 from "../components/HomeComponent1";
import HomeComponent2 from "../components/HomeComponent2";
import HomeComponent3 from "../components/HomeComponent3";
import HomeComponent4 from "../components/HomeComponent4";
import "../styles/homeStyle.css";
import { useNavigate } from "react-router-dom";
import HomeComponent5 from "../components/HomeComponent5";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      {/*header*/}
      <div className="header">
        <img src={logo} alt="logo" className="home-logo" />
        <button className="header-signup-btn" onClick={()=>navigate("/signup")}>Sign up free</button>
      </div>

      <div className="div-container">
        <HomeComponent1 />
        <HomeComponent2 />
        <HomeComponent3 />
        <HomeComponent4 />
        <HomeComponent5 />
      </div>
    </div>
  );
};

export default HomePage;
