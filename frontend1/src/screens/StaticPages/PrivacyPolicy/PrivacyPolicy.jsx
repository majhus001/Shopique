import { motion } from "framer-motion";
import { FiShield, FiLock, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import "./PrivacyPolicy.css";
import { Link } from "react-router-dom";


const PrivacyPolicy = () => {
  return (
    <motion.section
      className="pp-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="pp-content">
        <motion.div
          className="pp-header"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          <div className="pp-icon-wrapper">
            <FiShield className="pp-main-icon" />
          </div>
          <h1 className="pp-title">Privacy Policy</h1>
          <p className="pp-effective-date">Effective Date: August 1, 2025</p>
          <div className="pp-divider"></div>
        </motion.div>

        <div className="pp-sections-container">
          <div className="pp-section pp-card">
            <h2 className="pp-section-title">
              <span className="pp-section-number">1</span>
              What Information We Collect
            </h2>
            <p className="pp-text">
              We collect the following types of personal data to improve your
              experience:
            </p>
            <ul className="pp-list">
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>Personal Info: Name, email, phone number, address</span>
              </li>
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>
                  Order Details: Products, payment method (not card numbers)
                </span>
              </li>
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>Newsletter Signups: Email address</span>
              </li>
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>Device Info: Browser type, IP, OS</span>
              </li>
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>Usage Data: Page visits, clicks, time spent</span>
              </li>
            </ul>
          </div>

          <div className="pp-section pp-card">
            <h2 className="pp-section-title">
              <span className="pp-section-number">2</span>
              How We Use Your Information
            </h2>
            <ul className="pp-list">
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>To process and deliver your orders</span>
              </li>
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>To send order confirmations and updates</span>
              </li>
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>To personalize your shopping experience</span>
              </li>
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>To respond to your messages or feedback</span>
              </li>
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>To send promotional emails if subscribed</span>
              </li>
            </ul>
          </div>

          <div className="pp-section pp-card">
            <h2 className="pp-section-title">
              <span className="pp-section-number">3</span>
              Who We Share Data With
            </h2>
            <p className="pp-text">
              We do <strong className="pp-strong">not</strong> sell your data.
              We may share it with:
            </p>
            <ul className="pp-list">
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>Payment gateways (e.g., Razorpay, Stripe)</span>
              </li>
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>Delivery services (e.g., Delhivery, Bluedart)</span>
              </li>
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>Email tools (e.g., Resend, Mailchimp)</span>
              </li>
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>Analytics tools (e.g., Google Analytics)</span>
              </li>
            </ul>
          </div>

          <div className="pp-section pp-highlight-card">
            <div className="pp-highlight-icon">
              <FiLock />
            </div>
            <h2 className="pp-section-title">
              <span className="pp-section-number">4</span>
              How We Protect Your Data
            </h2>
            <ul className="pp-list">
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>Secure HTTPS and API encryption</span>
              </li>
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>Access controls for admin-only areas</span>
              </li>
              <li className="pp-list-item">
                <span className="pp-bullet"></span>
                <span>Data encrypted in databases</span>
              </li>
            </ul>
          </div>

          {/* Other sections continue with same pattern */}

          <div className="pp-contact-section pp-card">
            <Link to={"/contact"}>
              <h2 className="pp-section-title">
                <span className="pp-section-number">5</span>
                Contact Us
              </h2>
            </Link>
            <p className="pp-text">If you have any questions, contact us at:</p>
            <ul className="pp-contact-list">
              <li className="pp-contact-item">
                <FiMail className="pp-contact-icon" />
                <span>Email: theshopique@gmail.com</span>
              </li>
              <li className="pp-contact-item">
                <FiMapPin className="pp-contact-icon" />
                <span>Address: 123 Fashion Street, Style City, India</span>
              </li>
              <li className="pp-contact-item">
                <FiPhone className="pp-contact-icon" />
                <span>Phone: +91 9626203828</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pp-footer">
          <div className="pp-footer-content">
            <FiShield className="pp-footer-icon" />
            <p className="pp-footer-text">
              Thank you for trusting Shopique. We're committed to protecting
              your privacy.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default PrivacyPolicy;
