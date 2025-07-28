import { useState, useEffect } from "react";
import "../HomeStyle.css";
import axios from "axios";
import API_BASE_URL from "../../../api";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [banners, setBanners] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [direction, setDirection] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/banners/fetchimages`);
        if (res.data.success) setBanners(res.data.data);
      } catch (err) {
        console.error("Banner fetch failed:", err);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => slideToNext(), 4000);
    return () => clearInterval(interval);
  }, [banners, currentImage]);

  const slideToNext = () => {
    setDirection(1);
    setCurrentImage((prev) => (prev + 1) % banners.length);
  };

  const slideToPrev = () => {
    setDirection(-1);
    setCurrentImage((prev) =>
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 1,
      zIndex: 1,
    }),
    center: {
      x: 0,
      opacity: 1,
      zIndex: 2,
    },
    exit: (dir) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 1,
      zIndex: 1,
    }),
  };

  return (
    <section className="hero-section">
      <div className="hero-banner">
        <AnimatePresence custom={direction} mode="sync">
          {banners.length > 0 && (
            <motion.div
              key={currentImage}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "tween", ease: "easeInOut", duration: 0.6 },
              }}
              className="banner-image-container"
            >
              <img
                src={banners[currentImage]?.image}
                alt={banners[currentImage]?.title || `Banner ${currentImage + 1}`}
                className="banner-image"
                loading="lazy"
              />
              <div className="banner-overlay" />
              <div className="banner-content">
                <h2 className="ad-ban-disount-heading">
                  {banners[currentImage]?.title || "🔥 Hot Deals Await!"}
                </h2>
                <p>{banners[currentImage]?.description || "🔥Up to 50% off on selected items!"}</p>
                <button
                  className="ban-shop-now-btn"
                  onClick={() =>
                    navigate(banners[currentImage]?.link || "/products")
                  }
                >
                  Shop Now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav Arrows */}
        <div className="banner-nav-buttons">
          <button onClick={slideToPrev} className="banner-arrow left">
            <FiChevronLeft />
          </button>
          <button onClick={slideToNext} className="banner-arrow right">
            <FiChevronRight />
          </button>
        </div>

        {/* Dots */}
        <div className="banner-indicators">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentImage ? "active" : ""}`}
              onClick={() => {
                setDirection(index > currentImage ? 1 : -1);
                setCurrentImage(index);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;



{/* <motion.div
        className="countdown-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="countdown-content">
          <div className="countdown-title-timer-cont">
            <div className="countdown-header">
              <FiClock className="countdown-icon" />
              <h3>Limited Time Offer</h3>
            </div>
            <div className="timer-grid">
              <motion.div className="timer-block" whileHover={{ scale: 1.05 }}>
                <span className="timer-value">{timeLeft.days}</span>
                <span className="timer-label">Days</span>
              </motion.div>
              <motion.div className="timer-block" whileHover={{ scale: 1.05 }}>
                <span className="timer-value">{timeLeft.hours}</span>
                <span className="timer-label">Hours</span>
              </motion.div>
              <motion.div className="timer-block" whileHover={{ scale: 1.05 }}>
                <span className="timer-value">{timeLeft.minutes}</span>
                <span className="timer-label">Minutes</span>
              </motion.div>
              <motion.div className="timer-block" whileHover={{ scale: 1.05 }}>
                <span className="timer-value">{timeLeft.seconds}</span>
                <span className="timer-label">Seconds</span>
              </motion.div>
            </div>
          </div>
          <motion.button
            className="deal-btn"
            onClick={() => navigate("/products")}
            aria-label="Grab the deal"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiShoppingBag className="deal-icon" />
            <span>Grab the Deal</span>
          </motion.button>
        </div>
      </motion.div> */}