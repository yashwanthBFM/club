"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Check if we're on the homepage
  const isHomePage = pathname === "/";

  useEffect(() => {
    // Only apply scroll logic on homepage
    if (!isHomePage) return;

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
  }, [isHomePage]);

  // Determine navbar classes based on page
  const navbarClasses = isHomePage 
    ? `${styles.navbar} ${styles.navHidden}`  // Homepage: hidden by default, shows on scroll
    : `${styles.navbar} ${styles.navVisible}`; // Other pages: always visible

  return (
    <nav 
      id="mainNavbar" 
      className={navbarClasses}
    >
      <Link href="/" className={styles.logo} style={{ cursor: 'pointer' }}>
        <img src="/logo.png" alt="Renegades FC Logo" className={styles.logoImage} />
        <span>Renegades FC</span>
      </Link>

      <div className={`${styles.links} ${isOpen ? styles.showMenu : ""}`}>
        <Link href="/" onClick={closeMenu}>Home</Link>
        <a href="#about" onClick={closeMenu}>About</a>
        <a href="#info" onClick={closeMenu}>Why Us?</a>
        <a href="#meet" onClick={closeMenu}>Meet our Team</a>
        <a href="#gallery" onClick={closeMenu}>Gallery</a>
        <Link href="/register" onClick={closeMenu}>Join</Link>
      </div>
      <div className={styles.hamburger} onClick={toggleMenu}>
        <span />
        <span />
        <span />
      </div>
    </nav>
  );
}
