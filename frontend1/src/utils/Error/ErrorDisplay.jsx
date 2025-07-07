import { motion } from "framer-motion";
import {
  FiRefreshCw,
  FiWifiOff,
  FiAlertTriangle,
  FiServer,
  FiClock,
} from "react-icons/fi";
import "./ErrorDisplay.css";

const ErrorDisplay = ({ error, onRetry }) => {
 
  if (!error) return null;

  const errorType = error?.type || "generic";

  const errorConfig = {
    offline: {
      icon: <FiWifiOff className="error-icon" />,
      title: "Connection Lost",
      message:
        "You're currently offline. Please check your internet connection.",
      helpText: "Try turning on Wi-Fi or mobile data and try again.",
      buttonText: "Retry Connection",
      color: "#3b82f6",
    },
    network: {
      icon: <FiWifiOff className="error-icon" />,
      title: "Network Issues",
      message: "There seems to be a problem with your network connection.",
      helpText: "Check your network settings or try a different network.",
      buttonText: "Try Again",
      color: "#3b82f6",
    },
    timeout: {
      icon: <FiClock className="error-icon" />,
      title: "Request Timed Out",
      message: "The request took too long to complete.",
      helpText: "This might be due to a slow connection. Please try again.",
      buttonText: "Retry Now",
      color: "#f59e0b",
    },
    server: {
      icon: <FiServer className="error-icon" />,
      title: "Server Error",
      message: "We're having technical difficulties on our end.",
      helpText: "Our team has been notified. Please try again later.",
      buttonText: "Try Again",
      color: "#ef4444",
    },
    generic: {
      icon: <FiAlertTriangle className="error-icon" />,
      title: "Something Went Wrong",
      message:
        typeof error === "string"
          ? error
          : error?.message || "An unexpected error occurred.",
      helpText: "Please try again or contact support if the problem persists.",
      buttonText: "Try Again",
      color: "#ef4444",
    },
  };

  const { icon, title, message, helpText, buttonText, color } =
    errorConfig[errorType];

  return (
    <motion.div
      className="error-display-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="error-content">
        <motion.div
          className="error-icon-container"
          animate={{
            rotate: [0, -10, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 1],
          }}
          style={{ color }}
        >
          {icon}
        </motion.div>

        <motion.h3
          className="error-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.h3>

        <motion.p
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>

        <motion.div
          className="error-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {errorType !== "server" && (
            <motion.button
              onClick={onRetry}
              whileHover={{
                scale: 1.05,
                backgroundColor: color,
              }}
              whileTap={{ scale: 0.95 }}
              className="retry-button"
              style={{ backgroundColor: color }}
            >
              <FiRefreshCw className="retry-icon" />
              {buttonText}
            </motion.button>
          )}

          <p className="error-help-text">{helpText}</p>

          {errorType === "server" && (
            <div className="server-error-contact">
              <p>Need immediate help?</p>
              <a href="mailto:support@example.com">Contact Support</a>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ErrorDisplay;
