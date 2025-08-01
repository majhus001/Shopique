import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="footer-container">
        <div className="footer-grid">
          {/* Column 1 */}
          <motion.div
            className="footer-column"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/allproducts">Shop</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </motion.div>

          {/* Column 2 */}
          <motion.div
            className="footer-column"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="footer-heading">Support</h3>
            <ul className="footer-links">
              <li>
                <Link to="/faq">FAQs</Link>
              </li>
              <li>
                <Link to="/shipping">Shipping</Link>
              </li>
              <li>
                <Link to="/returns">Returns</Link>
              </li>
              <li>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </li>
            </ul>
          </motion.div>

          {/* Column 3 */}
          <motion.div
            className="footer-column"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="footer-heading">Customer Service</h3>
            <ul className="footer-links">
              <li>
                <Link to="/user/myorders">My Orders</Link>
              </li>
              <li>
                <Link to="/size-guide">Size Guide</Link>
              </li>
              <li>
                <Link to="/payment-options">Payment Options</Link>
              </li>
              <li>
                <Link to="/gift-cards">Gift Cards</Link>
              </li>
            </ul>
          </motion.div>

          {/* Column 4 - Contact & Social */}
          <motion.div
            className="footer-column"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="footer-heading">Connect With Us</h3>
            <div className="footer-social">
              <motion.a
                href=""
                className="social-icon"
                aria-label="Instagram"
                whileHover={{ y: -5, scale: 1.1 }}
              >
                <i className="fab fa-instagram"></i>
              </motion.a>
              <motion.a
                href="#"
                className="social-icon"
                aria-label="Facebook"
                whileHover={{ y: -5, scale: 1.1 }}
              >
                <i className="fab fa-facebook-f"></i>
              </motion.a>
              <motion.a
                href="#"
                className="social-icon"
                aria-label="Twitter"
                whileHover={{ y: -5, scale: 1.1 }}
              >
                <i className="fab fa-twitter"></i>
              </motion.a>
              <motion.a
                href="#"
                className="social-icon"
                aria-label="Pinterest"
                whileHover={{ y: -5, scale: 1.1 }}
              >
                <i className="fab fa-pinterest-p"></i>
              </motion.a>
            </div>

            <div className="footer-contact">
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>shopique@gmail.com</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone-alt"></i>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>123 Fashion St, Style City</span>
              </div>
            </div>
          </motion.div>
        </div>
        

        {/* Bottom Section */}
        <motion.div
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="footer-payment-methods">
            <i className="fab fa-cc-visa"></i>
            <i className="fab fa-cc-mastercard"></i>
            <i className="fab fa-cc-amex"></i>
            <i className="fab fa-cc-paypal"></i>
            <i className="fab fa-cc-apple-pay"></i>
          </div>

          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} ShopiQue. All rights reserved.
          </p>

          <div className="footer-legal">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
