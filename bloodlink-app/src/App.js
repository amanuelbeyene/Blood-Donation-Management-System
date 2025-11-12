// src/App.js
import React from 'react';
import styles from './App.module.css';
import Header from './components/Header';
import RoleCard from './components/RoleCard';
import Stats from './components/Stats';

// Import icons - FIXED
import { FaUserPlus, FaRegHospital } from 'react-icons/fa';
import { MdAccountBalance } from 'react-icons/md'; // <-- 1. IMPORT FROM /md

const donorFeatures = [
  "Register your blood type",
  "View donation requests",
  "Track your points",
  "Help save lives"
];

const hospitalFeatures = [
  "Submit emergency requests",
  "Find matching donors",
  "View donor map",
  "Manage requests"
];

const bloodBankFeatures = [
  "Manage blood inventory",
  "View incoming donations",
  "Fulfill hospital requests",
  "Track blood types"
];

function App() {
  return (
    <div className={styles.appContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        <RoleCard
          icon={<FaUserPlus />}
          title="I'm a Donor"
          description="Register as a blood donor, find donation opportunities, and track your impact."
          features={donorFeatures}
          buttonText="Enter as Donor"
          buttonColor="#d9242f" // Red
          iconColor="#d9242f"
        />
        <RoleCard
          icon={<FaRegHospital />}
          title="I'm a Hospital"
          description="Submit emergency requests, find matching donors, and manage blood needs."
          features={hospitalFeatures}
          buttonText="Enter as Hospital"
          buttonColor="#3b82f6" // Blue
          iconColor="#3b82f6"
        />
        
        <RoleCard
          icon={<MdAccountBalance />} // <-- 2. USE THE CORRECT ICON
          title="I'm a Blood Bank"
          description="Manage inventory, track donations, and fulfill requests from hospitals."
          features={bloodBankFeatures}
          buttonText="Enter as Blood Bank"
          buttonColor="#16a34a" // Green
          iconColor="#16a34a"
        />
      </main>

      <Stats />
    </div>
  );
}

export default App;