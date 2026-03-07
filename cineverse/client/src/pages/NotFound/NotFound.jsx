import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiHome, FiSearch } from 'react-icons/fi';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1>Lost in Space? 🎬</h1>
        <p className="error-message">
          We couldn't find the page you're looking for. It might have been moved, deleted, or you may have mistyped the address.
        </p>
        
        <div className="action-buttons">
          <Link to="/" className="btn btn-primary">
            <FiHome className="btn-icon" />
            Back to Home
          </Link>
          <Link to="/search" className="btn btn-secondary">
            <FiSearch className="btn-icon" />
            Search Movies
          </Link>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="glow-orb top-left"></div>
      <div className="glow-orb bottom-right"></div>
    </div>
  );
};

export default NotFound;
