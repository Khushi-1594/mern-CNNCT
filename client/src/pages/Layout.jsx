import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar"; 
import "../styles/dashboard.css"
import MobileViewHeader from "../components/MobileViewHeader";
import { useEffect, useState } from "react";

const Layout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dash-right-side">
      {isMobile && <MobileViewHeader />}
        <Outlet /> 
      </div>
    </div>
  );
};

export default Layout;
