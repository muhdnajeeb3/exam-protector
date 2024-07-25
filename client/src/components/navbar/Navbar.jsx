import React, { useState, useEffect } from "react";
import logo from "./../../assets/logofont.svg";
import "./navbar.css";
import { Link } from "react-router-dom";

const NavLinks = ({ username }) => (
  <>
    <p>
      <a href="/">Blog</a>
    </p>
    <p>
      <a href="/">Product</a>
    </p>
    <p>
      <a href="/">Community</a>
    </p>
    <p>
      <a href="/">Pricing</a>
    </p>
    <p>
      <a href="/">Contact Us</a>
    </p>
    <p>
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
        <img src='https://www.schneideit.com/wp-content/uploads/2020/12/schneide-logo.svg' alt="schneide-logo" />
      </div>
      <div className="landing-navbar-links">
        <NavLinks username={username} />
      </div>
    </div>
  );
};

export default Navbar;
