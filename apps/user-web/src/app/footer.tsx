'use client';
import React from 'react';
import styles from './footer.module.css';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Brand Section */}
        <div className={styles.column}>
          <a href="/">
          <div className={styles.logo}>
         <img src="/logo.png" alt="Renegades FC Logo" className={styles.logoImage} />
          <span className={styles.logoText}>Renegades FC</span>
          </div>
          </a>
          <p className={styles.description}>
            Our mission is to promote talent, passion, and teamwork through unforgettable football experiences.
          </p>
        </div>

        {/* Navigation */}
        <div className={styles.column}>
          <h3 className={styles.linkTitle}>Navigation</h3>
          <ul className={styles.list}>
            <li><a href="/">Home</a></li>
            <li><a href="#about">Our Club</a></li>
            <li><a href="#meet">Team</a></li>
            <li><a href="#gallery">Gallery</a></li>
          </ul>
        </div>

        {/* Support */}
        <div className={styles.column}>
          <h3 className={styles.linkTitle}>Support</h3>
          <ul className={styles.list}>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.column}>
          <h3 className={styles.linkTitle}>Contact</h3>
          <p><FaMapMarkerAlt /> 123 Stadium Road, NY, USA</p>
          <p><FaEnvelope  /> renegadesfc@example.com</p>
          <p><FaPhoneAlt /> +1 (555) 123-4567</p>
        </div>
      </div>
      <div className={styles.bottomNote}>
        &copy; {new Date().getFullYear()} Renegades FC. Developed by BrownFolk Media.
      </div>
    </footer>
  );
};

export default Footer;
