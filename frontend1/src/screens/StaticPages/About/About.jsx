import { motion } from "framer-motion";
import "./About.css";
import { useNavigate } from "react-router-dom";


const About = () => {
  const navigate = useNavigate();
  return (
    <motion.section
      className="about-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="about-container">
        {/* Hero Section */}
        <div className="about-hero">
          <motion.h1 
            className="about-title"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Hello! We're <span className="about-title-accent">Shopique</span>
          </motion.h1>
          <motion.p 
            className="about-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            A fresh new way to shop online
          </motion.p>
        </div>

        {/* Main Content */}
        <div className="about-content">
          <div className="about-card">
            <div className="about-card-icon">🌟</div>
            <h2 className="about-card-title">Our Beginning</h2>
            <p className="about-card-text">
              Born in 2023 from a simple idea: shopping should be fun, easy, and personal. 
              We're just starting out, but we're putting our hearts into every order.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">🎯</div>
            <h2 className="about-card-title">What We Do</h2>
            <p className="about-card-text">
              We carefully select products we believe in and deliver them straight to you. 
              No complicated choices, just good stuff you'll love.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">💡</div>
            <h2 className="about-card-title">Why Choose Us</h2>
            <p className="about-card-text">
              Because we're small enough to care about every customer, but ambitious enough 
              to keep improving your experience every day.
            </p>
          </div>
        </div>

        {/* Founder Note */}
        <div className="about-founder">
          <div className="about-founder-image"></div>
          <div className="about-founder-note">
            <h3 className="about-founder-title">A quick note from Shopique Team</h3>
            <p className="about-founder-text">
              "Building Shopique has been an exciting journey. Every order puts a smile 
              on our faces - thank you for being part of our story!"
            </p>
            <div className="about-founder-signature">— Majid, Founder</div>
          </div>
        </div>

        {/* CTA */}
        <div className="about-cta">
          <p className="about-cta-text">Ready to explore?</p>
          <motion.button 
            className="about-cta-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={()=>navigate("/allproducts")}
          >
            Start Shopping
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

export default About;