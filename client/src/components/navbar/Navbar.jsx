import React, { useState, useEffect } from "react";
import logo from "./../../assets/logofont.svg";
import "./navbar.css";
import { Link } from "react-router-dom";

const NavLinks = ({ username }) => (
  <>
    <p>
      <Link to='/status'>Status</Link>
    </p>
    <p>
      <Link to='/dashboard'>Dashboard</Link>
    </p>
    <p>
      <Link to='/suspicious'>Suspicious</Link>
    </p>
    <p>
      <Link to='/attendance'>Attendance</Link>
    </p>
    <p style={{fontWeight:username && '600',color:username && 'black'}}>
      {username ? username : (
        <Link to="/login" style={{color:'blue'}}>Login</Link>
      )}
    </p>
  </>
);

const Navbar = () => {
  const [username, setUsername] = useState(localStorage.getItem("user_name"));

  useEffect(() => {
    const handleStorageChange = () => {
      setUsername(localStorage.getItem("user_name"));
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="landing-navbar">
      <div className="landing-navbar-logo">
        <Link to='/'>
        <img src='https://www.schneideit.com/wp-content/uploads/2020/12/schneide-logo.svg' alt="schneide-logo" />
        </Link>
      </div>
      <div className="landing-navbar-links">
        <NavLinks username={username} />
      </div>
    </div>
  );
};

export default Navbar;
