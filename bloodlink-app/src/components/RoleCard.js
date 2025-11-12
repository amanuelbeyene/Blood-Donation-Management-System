// src/components/RoleCard.js
import React from 'react';
import styles from './RoleCard.module.css';
import { FaCheck } from 'react-icons/fa';

const RoleCard = ({ icon, title, description, features, buttonText, buttonColor, iconColor }) => {
  return (
    <div className={styles.card}>
      <div className={styles.icon} style={{ color: iconColor }}>
        {icon}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      
      <ul className={styles.features}>
        {features.map((feature, index) => (
          <li key={index}>
            <FaCheck className={styles.checkIcon} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <button 
        className={styles.button} 
        style={{ backgroundColor: buttonColor }}
      >
        {buttonText} →
      </button>
    </div>
  );
};

export default RoleCard;