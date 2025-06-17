"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Navbar2.module.css";

export default function Navbar2() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
  <img src="/logo.png" alt="Renegades FC Logo" className={styles.logoImage} />
  <span>Renegades FC</span>
</div>
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
