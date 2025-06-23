"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const navbar = document.getElementById('mainNavbar');

    const onScroll = () => {
      if (!navbar) return;
      if (window.scrollY > 50) {
        navbar.classList.add(styles.navVisible);
        navbar.classList.remove(styles.navHidden);
      } else {
        navbar.classList.add(styles.navHidden);
        navbar.classList.remove(styles.navVisible);
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav 
      id="mainNavbar" 
      className={`${styles.navbar} ${styles.navHidden}`}
    >
      <a href="/">
      <div className={styles.logo}>
  <img src="/logo.png" alt="Renegades FC Logo" className={styles.logoImage} />
  <span>Renegades FC</span>
</div>
</a>

      <div className={`${styles.links} ${isOpen ? styles.showMenu : ""}`}>
        <a href="/" onClick={closeMenu}>Home</a>
        <a href="#about" onClick={closeMenu}>About</a>
        <a href="#info" onClick={closeMenu}>Why Us?</a>
        <a href="#meet" onClick={closeMenu}>Meet our Team</a>
        <a href="#gallery" onClick={closeMenu}>Gallery</a>
        <a href="/register" onClick={closeMenu}>Join</a>

      </div>
      <div className={styles.hamburger} onClick={toggleMenu}>
        <span />
        <span />
        <span />
      </div>
    </nav>
  );
}
