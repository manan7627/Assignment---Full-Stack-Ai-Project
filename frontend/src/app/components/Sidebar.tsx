"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FileText, Sparkles, BookOpen, Settings, X } from 'lucide-react';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const pathname = usePathname();
  const [assignmentCount, setAssignmentCount] = useState(0);
  const { sidebarOpen, setSidebarOpen } = useAssignmentStore();

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

  const handleItemClick = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}
      
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>AI</div>
          Assessment Pro
          <button className={styles.sidebarCloseBtn} onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <Link href="/?view=create" style={{ textDecoration: 'none' }} onClick={handleItemClick}>
          <button className={styles.createBtn}>
            <Sparkles size={18} />
            Create Assignment
          </button>
        </Link>

        <div className={styles.nav}>
          <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`} onClick={handleItemClick}>
            <Home size={20} />
            Dashboard
          </Link>
          <Link href="/classes" className={`${styles.navItem} ${pathname === '/classes' ? styles.active : ''}`} onClick={handleItemClick}>
            <Users size={20} />
            My Classes
          </Link>
          <Link href="/assignments" className={`${styles.navItem} ${pathname === '/assignments' ? styles.active : ''}`} onClick={handleItemClick}>
            <FileText size={20} />
            Assignments
            {assignmentCount > 0 && <span className={styles.badge}>{assignmentCount}</span>}
          </Link>
          <Link href="/ai-toolkit" className={`${styles.navItem} ${pathname === '/ai-toolkit' ? styles.active : ''}`} onClick={handleItemClick}>
            <BookOpen size={20} />
            AI Toolkit
          </Link>
        </div>

        <div className={styles.footer}>
          <Link href="/settings" className={`${styles.navItem} ${pathname === '/settings' ? styles.active : ''}`} onClick={handleItemClick}>
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
    </>
  );
};

export default Sidebar;
