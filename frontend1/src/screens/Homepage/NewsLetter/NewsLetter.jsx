import { motion } from "framer-motion";
import { useState } from "react";
import axios from "axios";
import "./NewsLetter.css";
import API_BASE_URL from "../../../api";

const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);

      // API call to backend
      const response = await axios.post(
        `${API_BASE_URL}/api/newsletter/add`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setEmail("");
        setTimeout(() => setSuccess(false), 5000); // Hide success after 5s
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to subscribe. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      className="newsletter-section"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      aria-labelledby="newsletter-heading"
    >
      <div className="newsletter-container">
        <div className="newsletter-content">
          <h2 id="newsletter-heading">Stay Updated with Our Newsletter</h2>
          <p className="newsletter-subtitle">
            Join our community and receive exclusive offers, product updates,
            and insider tips
          </p>

          {success ? (
            <motion.div
              className="newsletter-success-message"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <i className="fas fa-check-circle"></i> Thank you for subscribing!
            </motion.div>
          ) : (
            <form
              className="newsletter-form"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="newsletter-input-group">
                <motion.input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address for newsletter"
                  aria-invalid={error ? "true" : "false"}
                  disabled={isLoading}
                  whileFocus={{
                    boxShadow: "0 0 0 2px var(--primary-color)",
                  }}
                />
                <motion.button
                  type="submit"
                  className="newsletter-submit-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading || success}
                  aria-label="Subscribe to newsletter"
                >
                  {isLoading ? (
                    <span className="newsletter-button-loader"></span>
                  ) : (
                    <>
                      <span className="newsletterbutton-text">Subscribe</span>
                      <i className="fas fa-paper-plane" aria-hidden="true"></i>
                    </>
                  )}
                </motion.button>
              </div>
              {error && (
                <motion.p
                  className="newsletter-error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <i className="fas fa-exclamation-circle"></i> {error}
                </motion.p>
              )}
              <p className="newsletter-privacy-note">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default NewsLetter;
