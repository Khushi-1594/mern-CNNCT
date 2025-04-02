import { Navigate, Route, Routes } from "react-router-dom"
import { useAuthStore } from "./store/authStore"
import { useEffect } from "react";
import { Toaster } from "react-hot-toast"
import LoginPage from "./pages/LoginPage";
import SignupPage1 from "./pages/SignupPage1";
import SignupPage2 from "./pages/SignupPage2";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Layout from "./pages/Layout";
import CreateEvent from "./pages/CreateEvent";
import Bookings from "./pages/Bookings";
import Availability from "./pages/Availability";
import "./styles/toastStyles.css";

function App() {
  const {user, authCheck, isCheckingAuth} = useAuthStore();
  
  useEffect(() =>{
    authCheck();
  },[authCheck])

  if(isCheckingAuth){
    return <div>Loading...</div>;
  }

  if(user){
    console.log("CNNCT User:", user);
  }

  return (
    <>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <HomePage />} />
        <Route path='/login' element={<LoginPage/>} />
        <Route path='/signup' element={<SignupPage1/>} />
        <Route path='/preferences' element={<SignupPage2/>} />
        <Route
          path="/dashboard"
          element={user ? <Layout /> : <Navigate to="/" />}
        >
          <Route index element={<Navigate to="/dashboard/events" />} />
          <Route path="events" element={<Dashboard />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="settings" element={<Settings />} />
          <Route path="availability" element={<Availability />} />
        </Route>
      </Routes>
      <Toaster/>
    </>
  )
}

export default App
