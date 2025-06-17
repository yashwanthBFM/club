import React from 'react';
import styles from './footer.module.css';
import { FaInstagram, FaTwitter, FaFacebook } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.topSection}>
        <div className={styles.logo}>
  <img src="/logo.png" alt="Renegades FC Logo" className={styles.logoImage} />

        <h2 className={styles.logo}>Renegades FC</h2>
        </div>
        <div className={styles.bottomSection}>
        <p>&copy; {new Date().getFullYear()} Renegades FC. All rights reserved.</p>
        <p className={styles.developer}>Developed by BrownFolk Media</p>
      </div>

        

        <div className={styles.socials}>
          <div className={styles.contact}>
          <h3>Contact Us</h3>
          <p>Email: renegadesfc@example.com</p>
          <p>Phone: +1 (555) 123-4567</p>
        </div>
        </div>
      </div>

      
    </footer>
  );
};

export default Footer;
