import React from 'react'
import twitter from '../assets/twitter.png';
import insta from '../assets/instagram.png';
import youtube from '../assets/youtube.png';
import tiktok from '../assets/tik-tok.png';
import app from '../assets/app-icon.png';
import { useNavigate } from 'react-router-dom';

const HomeComponent5 = () => {
    const navigate = useNavigate();
  return (
    <div className='container-7'>
        <div className='first-half'>
            <div className='auth-btns'>
                <button className='home-login-btn' onClick={() => navigate("/login")}>Log in</button>
                <button className='header-signup-btn cont7-signup-btn' onClick={() => navigate("/signup")}>Sing up free</button>
            </div>
            <div className='cont7-content'>
                <p>About CNNCT</p>
                <p>Blog</p>
                <p>Press</p>
                <p>Social Good</p>
                <p>Contact</p>
            </div>
            <div className='cont7-content'>
                <p>Careers</p>
                <p>Getting Started</p>
                <p>Features and How-Tos</p>
                <p>FaQs</p>
                <p>Report a Violation</p>
            </div>
            <div className='cont7-content'>
                <p>Terms and Conditions</p>
                <p>Privacy Policy</p>
                <p>Cookie Notice</p>
                <p>Trust Center</p>
            </div>
        </div>
        <div className='second-half'>
            <div className='cont7-info'>
            We acknowledge the Traditional Custodians of the land on which our office stands, The Wurundjeri people of the Kulin Nation, and pay our respects to Elders past, present and emerging.
            </div>
            <div className='contact-icons'>
                <img src={twitter} alt='twitter-icon'/>
                <img src={insta} alt='instagram-icon'/>
                <img src={youtube} alt='youtube-icon'/>
                <img src={tiktok} alt='tiktok-icon'/>
                <img src={app} alt='app-icon'/>
            </div>
        </div>
    </div>
  )
}

export default HomeComponent5