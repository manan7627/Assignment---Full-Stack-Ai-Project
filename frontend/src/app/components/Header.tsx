"use client";

import React from 'react';
import { ArrowLeft, Bell, ChevronDown } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
}

const Header = ({ title = 'Assessment Creator' }: HeaderProps) => {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <button className={styles.backBtn} onClick={() => window.location.href = '/'}>
          <ArrowLeft size={20} />
        </button>
        <span>{title}</span>
      </div>

      <div className={styles.right}>
        <div className={styles.bellWrapper}>
          <Bell size={20} />
          <div className={styles.redDot}></div>
        </div>
        <div className={styles.userProfile}>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher" alt="User" className={styles.avatar} />
          <span className={styles.userName}>Educator Profile</span>
          <ChevronDown size={16} color="var(--text-secondary)" />
        </div>
      </div>
    </div>
  );
};

export default Header;
