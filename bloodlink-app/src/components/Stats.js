// src/components/Stats.js
import React from 'react';
import styles from './Stats.module.css';

const Stats = () => {
  return (
    <footer className={styles.statsContainer}>
      <div className={styles.statItem}>
        <span className={styles.count}>0</span>
        <span className={styles.label}>Registered Donors</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.count}>0</span>
        <span className={styles.label}>Lives Saved</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.count}>0</span>
        <span className={styles.label}>Emergency Requests</span>
      </div>
    </footer>
  );
};

export default Stats;