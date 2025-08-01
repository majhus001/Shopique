import { motion } from "framer-motion";
import { useState } from "react";
import axios from "axios";
import "./Contact.css";
import API_BASE_URL from "../../../api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/contact/support/submit`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        alert(
          `${response.data.message}, ${formData.name}! We'll contact you soon.`
        );
        setFormData({ name: "", email: "", message: "" });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong!";
      alert(msg);
      console.error("Contact form error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.section
      className="contact-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="contact-container">
        <motion.div
          className="contact-header"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="contact-title">Get in Touch</h1>
          <p className="contact-subtitle">
            We'd love to hear from you! Whether you have a question or just want
            to say hi, reach out and we'll respond as soon as we can.
          </p>
        </motion.div>

        <div className="contact-grid">
          {/* Contact Info */}
          <motion.div
            className="contact-info"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="contact-info-title">Contact Information</h2>
            <div className="contact-info-item">
              <div className="contact-icon">📍</div>
              <div>
                <h3>Our Office</h3>
                <p>123 Fashion Street, Style City, India</p>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-icon">📧</div>
              <div>
                <h3>Email</h3>
                <p>theshopique@gmail.com</p>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-icon">📞</div>
              <div>
                <h3>Phone</h3>
                <p>+91 9626203828</p>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-icon">⏰</div>
              <div>
                <h3>Working Hours</h3>
                <p>Mon - Sat: 10 AM – 6 PM</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="contact-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="contact-form-title">Send Us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="contact-form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="contact-form-group">
                <label htmlFor="email">Your Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="contact-form-group">
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <motion.button
                type="submit"
                className="contact-submit-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default Contact;
