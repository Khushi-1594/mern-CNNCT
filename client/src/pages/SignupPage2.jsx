import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import image from "../assets/image1.png";
import logo from "../assets/logo.png";
import salesIcon from "../assets/sales.png";
import financeIcon from "../assets/finance.png";
import consultingIcon from "../assets/consulting.png";
import techIcon from "../assets/tech.png";
import educationIcon from "../assets/education.png";
import governmentIcon from "../assets/government.png";
import recruitingIcon from "../assets/recruiting.png";
import marketingIcon from "../assets/marketing.png";
import '../styles/style2.css';
import { showErrorToast } from './toastUtils';

const SignupPage2 = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData, signup, isSigningUp } = useAuthStore();
  const [data, setData] = useState({
    username: signupData.username || "",
    category: signupData.category || "",
  });

  const categories = [
    { name: "Sales", icon: salesIcon },
    { name: "Finance", icon: financeIcon },
    { name: "Consulting", icon: consultingIcon },
    { name: "Tech", icon: techIcon },
    { name: "Education", icon: educationIcon },
    { name: "Government & Politics", icon: governmentIcon },
    { name: "Recruiting", icon: recruitingIcon },
    { name: "Marketing", icon: marketingIcon },
  ];

  const handleChange = (e) =>{
    setData({...data, [e.target.name] : e.target.value});
  }

  const handleCategory = (category) =>{
    setData({...data, category});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!data.username){
      showErrorToast("All fields are required.")
      return;
    }

    if(!data.category){
        showErrorToast("Please select a category")
        return;
    }

    const finalData = {
        ...signupData,
        ...data,
    }
    await signup(finalData);
    navigate("/dashboard")
  };

  return (
    <div className="preferences-container">
      <div className="pref-left-side">
      <div className="signup2-logo">
          <img src={logo} alt="logo" />
        </div>
          <form onSubmit={handleSubmit} className="pref-form">
          <h1>Your Preferences</h1>
            <input
              type="text"
              name="username"
              value={data.username}
              onChange={handleChange}
              placeholder="Tell us your username"
            />
            <h3>Select one category that best describes your CNNCT:</h3>
            <div className="categories">
              {categories.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => handleCategory(item.name)}
                  className={data.category === item.name ? "active" : ""}
                >
                <img src={item.icon} alt={item.name}/>
                  {item.name}
                </button>
              ))}
            </div>
            <button type="submit" disabled={isSigningUp}>
              {isSigningUp ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        
      </div>

      <div className="right-side-image">
        <img src={image} alt="Login Visual" className="image-fit" />
      </div>
    </div>
  );
}

export default SignupPage2