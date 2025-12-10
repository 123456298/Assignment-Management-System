import React from "react";
import "./Navbar.css"; // optional CSS file

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">Assignment Manager</h2>

      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/assignments">Assignments</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  );
}
