import React from "react";
import audio from "../assets/audio-icon.png";
import brandsin from "../assets/town-icon.png";
import bonfire from "../assets/bonfire-icon.png";
import books from "../assets/books-icon.png";
import gift from "../assets/gift-icon.png";
import cameo from "../assets/cameo-icon.png";
import clubhouse from "../assets/clubhouse-icon.png";
import community from "../assets/community-icon.png";
import contact from "../assets/contactdetails-icon.png";

const HomeComponent4 = () => {
  return (
    <div className="container-6">
      <h2>All Link Apps and Integrations</h2>
      <div className="link-apps">
        <div className="app-details">
          <img src={audio} alt="audio-icon" />
          <div className="app-content">
            <p className="app-name">Audiomack</p>
            <p className="description">Add an Audiomack player to your Linktree</p>
          </div>
        </div>
        <div className="app-details">
          <img src={brandsin} alt="brandsin-icon" />
          <div className="app-content">
            <p className="app-name">Brandsintown</p>
            <p className="description">Drive ticket sales by listing your events</p>
          </div>
        </div>
        <div className="app-details">
          <img src={bonfire} alt="bonfire-icon" />
          <div className="app-content">
            <p className="app-name">Bonfire</p>
            <p className="description">Display and sell your custom merch</p>
          </div>
        </div>
        <div className="app-details">
          <img src={books} alt="bonfire-icon" />
          <div className="app-content">
            <p className="app-name">Books</p>
            <p className="description">Promote books on your Linktree</p>
          </div>
        </div>
        <div className="app-details">
          <img src={gift} alt="gift-icon" />
          <div className="app-content">
            <p className="app-name">Buy Me A Gift</p>
            <p className="description">Let visitors support you with a small gift</p>
          </div>
        </div>
        <div className="app-details">
          <img src={cameo} alt="gift-icon" />
          <div className="app-content">
            <p className="app-name">Cameo</p>
            <p className="description">Make impossible fan connections possible</p>
          </div>
        </div>
        <div className="app-details">
          <img src={clubhouse} alt="clubhouse-icon" />
          <div className="app-content">
            <p className="app-name">clubhouse</p>
            <p className="description">Let your community in on the conversation</p>
          </div>
        </div>
        <div className="app-details">
          <img src={community} alt="community-icon" />
          <div className="app-content">
            <p className="app-name">Community</p>
            <p className="description">Build an SMS subscriber list</p>
          </div>
        </div>
        <div className="app-details">
          <img src={contact} alt="contact-icon" />
          <div className="app-content">
            <p className="app-name">Contact Details</p>
            <p className="description">Easily share downloadable contact details</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeComponent4;
