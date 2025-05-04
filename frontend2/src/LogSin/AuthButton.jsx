import React from 'react';
import './AuthButton.css';

const AuthButton = ({ 
  type = 'button', 
  onClick, 
  disabled = false, 
  isLoading = false, 
  loadingText = 'Loading...', 
  children 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className="auth-button"
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span className="loading-text">{loadingText}</span>
        </div>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
};

export default AuthButton;
