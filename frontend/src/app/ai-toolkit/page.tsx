"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import styles from './page.module.css';
import { Sparkles, BookOpen, FileText, BarChart3, Zap, ArrowRight, Crown } from 'lucide-react';

export default function AIToolkit() {
  const router = useRouter();
  const [stats, setStats] = useState({ qGen: 0, schools: 0, uptime: 0 });

  useEffect(() => {
    // Animate stats counting up
    let qGen = 0;
    let schools = 0;
    let uptime = 0;
    const interval = setInterval(() => {
      qGen += Math.floor(1000 / 20);
      schools += Math.floor(50 / 20);
      uptime += (99.9 / 20);
      
      if (qGen >= 1000) {
        setStats({ qGen: 1000, schools: 50, uptime: 99.9 });
        clearInterval(interval);
      } else {
        setStats({ qGen, schools, uptime });
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <Header title="AI Toolkit" />
      
      <div className={styles.heroSection}>
        <div className={styles.heroBadge}>
          <Zap size={16} color="#F95020" /> Powered by Google Gemini 2.5 Flash
        </div>
        <h1 className={styles.heroTitle}>
          Supercharge your teaching with <span className={styles.gradientText}>AI Tools</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Discover our suite of intelligent tools designed specifically for modern educators to save time and enhance learning outcomes.
        </p>
      </div>

      <div className={styles.grid}>
        {/* Tool 1 - Active */}
        <div className={styles.card} onClick={() => router.push('/?view=create')} style={{cursor: 'pointer'}}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper} style={{background: 'linear-gradient(135deg, #FF6A00 0%, #EE0979 100%)', color: 'white'}}>
              <Sparkles size={24} />
            </div>
            <div className={styles.activeTag}>Active</div>
          </div>
          <h3 className={styles.cardTitle}>Generate Assessment</h3>
          <p className={styles.cardDesc}>Create AI-powered question papers instantly based on your specific requirements and syllabus.</p>
          <div className={styles.cardAction}>
            Try it now <ArrowRight size={16} />
          </div>
        </div>

        {/* Tool 2 - Coming Soon */}
        <div className={styles.cardDisabled}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapperDisabled}>
              <BookOpen size={24} />
            </div>
            <div className={styles.soonTag}>Coming Soon</div>
          </div>
          <h3 className={styles.cardTitle}>Analyze Curriculum</h3>
          <p className={styles.cardDesc}>Upload your syllabus for smart analysis and automatic lesson plan generation.</p>
        </div>

        {/* Tool 3 - Coming Soon */}
        <div className={styles.cardDisabled}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapperDisabled}>
              <FileText size={24} />
            </div>
            <div className={styles.soonTag}>Coming Soon</div>
          </div>
          <h3 className={styles.cardTitle}>Study Guide Generator</h3>
          <p className={styles.cardDesc}>Automatically generate comprehensive study materials from your class notes.</p>
        </div>

        {/* Tool 4 - Premium */}
        <div className={styles.cardDisabled}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapperDisabled}>
              <BarChart3 size={24} />
            </div>
            <div className={styles.premiumTag}><Crown size={12} /> Premium</div>
          </div>
          <h3 className={styles.cardTitle}>Performance Analytics</h3>
          <p className={styles.cardDesc}>Track student performance with AI insights to identify learning gaps.</p>
        </div>
      </div>

      <div className={styles.statsSection}>
        <div className={styles.statBox}>
          <div className={styles.statNum}>{stats.qGen >= 1000 ? '1000+' : stats.qGen}</div>
          <div className={styles.statLabel}>Questions Generated</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statNum}>{stats.schools >= 50 ? '50+' : stats.schools}</div>
          <div className={styles.statLabel}>Schools Onboarded</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statNum}>{stats.uptime >= 99.9 ? '99.9' : stats.uptime.toFixed(1)}%</div>
          <div className={styles.statLabel}>System Uptime</div>
        </div>
      </div>
    </div>
  );
}
