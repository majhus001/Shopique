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
      className="ad-auth-button"
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className="ad-loading-container">
          <div className="ad-spinner"></div>
          <span className="ad-loading-text">{loadingText}</span>
        </div>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
};

export default AuthButton;
