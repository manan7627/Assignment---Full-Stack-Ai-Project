"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, Sparkles, BookOpen, Settings } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const pathname = usePathname();
  const [assignmentCount, setAssignmentCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/assignments/stats`);
        if (res.ok) {
          const data = await res.json();
          setAssignmentCount(data.total || 0);
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    fetchCount();
  }, []);

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>AI</div>
        Assessment Pro
      </div>

      <Link href="/?view=create" style={{ textDecoration: 'none' }}>
        <button className={styles.createBtn}>
          <Sparkles size={18} />
          Create Assignment
        </button>
      </Link>

      <div className={styles.nav}>
        <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
          <Home size={20} />
          Dashboard
        </Link>
        <Link href="/classes" className={`${styles.navItem} ${pathname === '/classes' ? styles.active : ''}`}>
          <Users size={20} />
          My Classes
        </Link>
        <Link href="/assignments" className={`${styles.navItem} ${pathname === '/assignments' ? styles.active : ''}`}>
          <FileText size={20} />
          Assignments
          {assignmentCount > 0 && <span className={styles.badge}>{assignmentCount}</span>}
        </Link>
        <Link href="/ai-toolkit" className={`${styles.navItem} ${pathname === '/ai-toolkit' ? styles.active : ''}`}>
          <BookOpen size={20} />
          AI Toolkit
        </Link>
      </div>

      <div className={styles.footer}>
        <Link href="/settings" className={`${styles.navItem} ${pathname === '/settings' ? styles.active : ''}`}>
          <Settings size={20} />
          Settings
        </Link>
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
