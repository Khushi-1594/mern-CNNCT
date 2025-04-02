import React from "react";
import starIcon from "../assets/star-icon.png";
import profileIcon from "../assets/avatar.png";
import "../styles/homeStyle.css";

const HomeComponent3 = () => {
  return (
    <div>
      {/*div4*/}
      <div className="container-4">
        <div className="cont4-left-side">
          <h3>Here's what our customer has to says</h3>
          <button>Read customer stories</button>
        </div>
        <div className="cont4-right-side">
          <img src={starIcon} alt="starIcon" className="star-icon" />
          <p>
            [short description goes in here] lorem ipsum is a placeholder text
            to demonstrate.
          </p>
        </div>
      </div>

      {/*div 5*/}
      <div className="container-5">
        <div className="testimonial test-A">
          <p className="heading">Amazing tool! Saved me months</p>
          <p>
            This is a placeholder for your testimonials and what your client has
            to say, put them here and make sure it's 100% true and meaningful.
          </p>
          <div className="testimonial-user">
            <img src={profileIcon} alt="User Profile" />
            <div>
              <span>John Master</span>
              <p>Director, Spark.com</p>
            </div>
          </div>
        </div>

        <div className="testimonial">
          <p className="heading">Amazing tool! Saved me months</p>
          <p>
            This is a placeholder for your testimonials and what your client has
            to say, put them here and make sure it's 100% true and meaningful.
          </p>
          <div className="testimonial-user">
            <img src={profileIcon} alt="User Profile" />
            <div>
              <span>John Master</span>
              <p>Director, Spark.com</p>
            </div>
          </div>
        </div>

        <div className="testimonial">
          <p className="heading">Amazing tool! Saved me months</p>
          <p>
            This is a placeholder for your testimonials and what your client has
            to say, put them here and make sure it's 100% true and meaningful.
          </p>
          <div className="testimonial-user">
            <img src={profileIcon} alt="User Profile" />
            <div>
              <span>John Master</span>
              <p>Director, Spark.com</p>
            </div>
          </div>
        </div>

        <div className="testimonial test-A">
          <p className="heading">Amazing tool! Saved me months</p>
          <p>
            This is a placeholder for your testimonials and what your client has
            to say, put them here and make sure it's 100% true and meaningful.
          </p>
          <div className="testimonial-user">
            <img src={profileIcon} alt="User Profile" />
            <div>
              <span>John Master</span>
              <p>Director, Spark.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeComponent3;
