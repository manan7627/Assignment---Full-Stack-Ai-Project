"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Bell, ChevronDown, Check, User, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
}

const Header = ({ title = 'Assessment Creator' }: HeaderProps) => {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <span>{title}</span>
      </div>

      <div className={styles.right}>
        <div className={styles.dropdownWrapper} ref={notifRef}>
          <div className={styles.bellWrapper} onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            <div className={styles.redDot}></div>
          </div>
          
          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <div className={styles.dropdownHeader}>
                <span style={{fontWeight: 600}}>Notifications</span>
                <span style={{fontSize: '12px', color: 'var(--accent-orange)'}}>3 New</span>
              </div>
              <div className={styles.notifItem}>
                <div className={styles.notifIcon} style={{background: '#e8f5e9', color: '#2e7d32'}}>
                  <Check size={14} />
                </div>
                <div className={styles.notifContent}>
                  <p>Assessment generated successfully</p>
                  <span className={styles.notifTime}>2 min ago</span>
                </div>
              </div>
              <div className={styles.notifItem}>
                <div className={styles.notifIcon} style={{background: '#e3f2fd', color: '#1565c0'}}>
                  <Bell size={14} />
                </div>
                <div className={styles.notifContent}>
                  <p>New AI model available for use</p>
                  <span className={styles.notifTime}>1 hour ago</span>
                </div>
              </div>
              <div className={styles.notifItem}>
                <div className={styles.notifIcon} style={{background: '#fff3e0', color: '#ef6c00'}}>
                  <Bell size={14} />
                </div>
                <div className={styles.notifContent}>
                  <p>Welcome to VedaAI Assessment Creator!</p>
                  <span className={styles.notifTime}>1 day ago</span>
                </div>
              </div>
              <div className={styles.dropdownFooter}>
                Mark all as read
              </div>
            </div>
          )}
        </div>

        <div className={styles.dropdownWrapper} ref={profileRef}>
          <div className={styles.userProfile} onClick={() => setShowProfile(!showProfile)}>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher" alt="User" className={styles.avatar} />
            <span className={styles.userName}>Educator Profile</span>
            <ChevronDown size={16} color="var(--text-secondary)" />
          </div>
          
          {showProfile && (
            <div className={styles.profileDropdown}>
              <Link href="/settings" className={styles.dropdownItem}>
                <User size={16} /> My Profile
              </Link>
              <Link href="/settings" className={styles.dropdownItem}>
                <SettingsIcon size={16} /> Preferences
              </Link>
              <div className={styles.dropdownDivider}></div>
              <div className={styles.dropdownItem} style={{color: '#ef4444'}} onClick={() => console.log('Signing out...')}>
                <LogOut size={16} /> Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
