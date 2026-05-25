"use client";

import React from 'react';
import { Home, Users, FileText, Sparkles, BookOpen, Settings } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>AI</div>
        Assessment Pro
      </div>

      <button className={styles.createBtn} onClick={() => window.location.href = '/'}>
        <Sparkles size={18} />
        Create Assignment
      </button>

      <div className={styles.nav}>
        <div className={`${styles.navItem} ${styles.active}`}>
          <Home size={20} />
          Dashboard
        </div>
        <div className={styles.navItem}>
          <Users size={20} />
          My Classes
        </div>
        <div className={styles.navItem}>
          <FileText size={20} />
          Assignments
          <span className={styles.badge}>12</span>
        </div>
        <div className={styles.navItem}>
          <BookOpen size={20} />
          AI Toolkit
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.navItem}>
          <Settings size={20} />
          Settings
        </div>
        <div className={styles.schoolProfile}>
          <img src="https://api.dicebear.com/7.x/identicon/svg?seed=Teacher" alt="School" className={styles.schoolAvatar} />
          <div className={styles.schoolInfo}>
            <span className={styles.schoolName}>Teacher Workspace</span>
            <span className={styles.schoolLocation}>Premium Account</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
