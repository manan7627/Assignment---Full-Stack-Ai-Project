"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import styles from './page.module.css';
import { User, Bell, Key, Save, Shield } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className={styles.container}>
      <Header title="Settings" />
      
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          Settings & Preferences
        </div>
        <div className={styles.pageSubtitle}>Manage your account and application preferences</div>
      </div>

      <div className={styles.settingsLayout}>
        <div className={styles.sidebar}>
          <div 
            className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} /> My Profile
          </div>
          <div 
            className={`${styles.navItem} ${activeTab === 'preferences' ? styles.active : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <Bell size={18} /> Preferences
          </div>
          <div 
            className={`${styles.navItem} ${activeTab === 'api' ? styles.active : ''}`}
            onClick={() => setActiveTab('api')}
          >
            <Key size={18} /> API Configuration
          </div>
        </div>

        <div className={styles.content}>
          {activeTab === 'profile' && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Profile Information</h2>
              <p className={styles.sectionSubtitle}>Update your personal details here.</p>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input type="text" className={styles.input} defaultValue="Educator Profile" />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input type="email" className={styles.input} defaultValue="teacher@vedaai.com" />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>School / Institution</label>
                <input type="text" className={styles.input} defaultValue="Veda Institute" />
              </div>

              <button className={styles.saveBtn}>
                <Save size={16} /> Save Changes
              </button>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Preferences</h2>
              <p className={styles.sectionSubtitle}>Manage how the application behaves.</p>
              
              <div className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleTitle}>Email Notifications</div>
                  <div className={styles.toggleDesc}>Receive updates when generations complete</div>
                </div>
                <div className={styles.toggleSwitch} data-active="true">
                  <div className={styles.toggleKnob}></div>
                </div>
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleTitle}>Dark Mode</div>
                  <div className={styles.toggleDesc}>Switch to dark theme (Coming Soon)</div>
                </div>
                <div className={styles.toggleSwitch} data-active="false">
                  <div className={styles.toggleKnob}></div>
                </div>
              </div>

              <button className={styles.saveBtn} style={{marginTop: 24}}>
                <Save size={16} /> Save Preferences
              </button>
            </div>
          )}

          {activeTab === 'api' && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>API Configuration</h2>
              <p className={styles.sectionSubtitle}>Configure external integrations</p>
              
              <div className={styles.statusBox}>
                <Shield size={24} color="#4CAF50" />
                <div>
                  <div style={{fontWeight: 600}}>System Connected</div>
                  <div style={{fontSize: 13, color: 'var(--text-secondary)'}}>Backend API is operational and secure</div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Google Gemini API Key</label>
                <input type="password" className={styles.input} defaultValue="••••••••••••••••••••••••" readOnly />
                <p style={{fontSize: 12, color: 'var(--text-secondary)', marginTop: 8}}>
                  To update your key, please modify the backend environment variables.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
