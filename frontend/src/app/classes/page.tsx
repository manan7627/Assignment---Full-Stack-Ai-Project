"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import styles from './page.module.css';
import { Users, GraduationCap, Plus, BookOpen, MoreVertical, Search } from 'lucide-react';

export default function Classes() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const mockClasses = [
    { id: 1, name: 'Class 8A', subject: 'Science', students: 32, color: '#4CAF50' },
    { id: 2, name: 'Class 9B', subject: 'Mathematics', students: 28, color: '#2196F3' },
    { id: 3, name: 'Class 10C', subject: 'English', students: 35, color: '#FF9800' },
    { id: 4, name: 'Class 7A', subject: 'Social Studies', students: 30, color: '#9C27B0' },
    { id: 5, name: 'Class 11A', subject: 'Physics', students: 24, color: '#E91E63' },
    { id: 6, name: 'Class 12B', subject: 'Chemistry', students: 22, color: '#00BCD4' },
  ];

  const filteredClasses = mockClasses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <Header title="My Classes" />
      
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.pageTitle}>
            <GraduationCap size={24} color="var(--accent-orange)" />
            Class Management
          </div>
          <div className={styles.pageSubtitle}>Manage your classes and student cohorts</div>
        </div>
        
        <button className={styles.addBtn}>
          <Plus size={18} /> Add New Class
        </button>
      </div>

      <div className={styles.searchBar}>
        <Search size={18} color="var(--text-secondary)" />
        <input 
          type="text" 
          placeholder="Search classes or subjects..." 
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.grid}>
        {filteredClasses.map((cls) => (
          <div key={cls.id} className={styles.classCard}>
            <div className={styles.cardAccent} style={{backgroundColor: cls.color}}></div>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper} style={{backgroundColor: `${cls.color}20`, color: cls.color}}>
                <BookOpen size={20} />
              </div>
              <button className={styles.moreBtn}>
                <MoreVertical size={16} />
              </button>
            </div>
            
            <h3 className={styles.className}>{cls.name}</h3>
            <p className={styles.subject}>{cls.subject}</p>
            
            <div className={styles.cardFooter}>
              <div className={styles.studentCount}>
                <Users size={16} color="var(--text-secondary)" />
                {cls.students} Students
              </div>
              <div className={styles.viewLink}>View Class</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
