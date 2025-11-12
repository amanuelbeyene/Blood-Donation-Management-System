// src/components/Header.js
import React from 'react';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span>B</span>
      </div>
      <h1 className={styles.title}>Blood Donation Managment Ethiopia</h1>
      <p className={styles.subtitle}>
        Connecting blood donors with hospitals in need. Your donation can save lives.
      </p>
    </header>
  );
};

export default Header;