import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./Footer.css";
const Footer = () => {
  return (
    <motion.footer
      className="cat-footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="cat-footer-container">
        <div className="cat-footer-grid">
          {/* Column 1 */}
          <motion.div
            className="cat-footer-column"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="cat-footer-heading">Quick Links</h3>
            <ul className="cat-footer-links">
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
            className="cat-footer-column"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="cat-footer-heading">Support</h3>
            <ul className="cat-footer-links">
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
                <Link to="/privacy">Privacy Policy</Link>
              </li>
            </ul>
          </motion.div>

          {/* Column 3 - Social Media */}
          <motion.div
            className="cat-footer-column"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="cat-footer-heading">Connect With Us</h3>
            <div className="cat-footer-social-icons">
              <motion.a 
                href="#" 
                className="cat-social-icon"
                aria-label="Instagram"
                whileHover={{ y: -5, scale: 1.1 }}
              >
                <i className="fab fa-instagram"></i>
              </motion.a>
              <motion.a 
                href="#" 
                className="cat-social-icon"
                aria-label="Facebook"
                whileHover={{ y: -5, scale: 1.1 }}
              >
                <i className="fab fa-facebook-f"></i>
              </motion.a>
              <motion.a 
                href="#" 
                className="cat-social-icon"
                aria-label="Twitter"
                whileHover={{ y: -5, scale: 1.1 }}
              >
                <i className="fab fa-twitter"></i>
              </motion.a>
              <motion.a 
                href="#" 
                className="cat-social-icon"
                aria-label="Pinterest"
                whileHover={{ y: -5, scale: 1.1 }}
              >
                <i className="fab fa-pinterest-p"></i>
              </motion.a>
            </div>
            <div className="cat-footer-contact">
              <p>
                <i className="fas fa-envelope"></i> hello@example.com
              </p>
              <p>
                <i className="fas fa-phone-alt"></i> +1 (555) 123-4567
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="cat-footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="cat-footer-copyright">
            &copy; {new Date().getFullYear()} Your Brand. All rights reserved.
          </p>
          <div className="cat-footer-legal">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;