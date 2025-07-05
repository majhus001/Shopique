// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found-page">
      <h1>😕 Page Not Found</h1>
      <p>Looks like something went wrong or the page doesn't exist.</p>
      <Link to="/">Go back to Home</Link>
    </div>
  );
};

export default NotFound;
