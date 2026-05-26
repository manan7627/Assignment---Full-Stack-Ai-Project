"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import styles from './page.module.css';
import { Search, Filter, Trash2, Eye, Calendar, FileText } from 'lucide-react';

export default function Assignments() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/assignments`);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/assignments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAssignments(assignments.filter(a => a._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete assignment:', err);
    }
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesFilter = filter === 'All' || a.status === filter;
    const matchesSearch = a.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a._id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className={styles.container}>
      <Header title="Assignment History" />
      
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <FileText size={24} color="var(--accent-orange)" />
          Your Assessments
        </div>
        <div className={styles.pageSubtitle}>Manage and review all your previously generated assessments</div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search by title or ID..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className={styles.filterTabs}>
          {['All', 'COMPLETED', 'PENDING', 'FAILED'].map(tab => (
            <div 
              key={tab} 
              className={`${styles.filterTab} ${filter === tab ? styles.activeTab : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab === 'All' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.emptyState}>Loading assignments...</div>
      ) : filteredAssignments.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><FileText size={48} /></div>
          <h3>No assignments found</h3>
          <p>You haven't generated any assessments that match this criteria.</p>
          <button className={styles.createBtn} onClick={() => router.push('/?view=create')}>Create New</button>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Assessment Title</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Questions</th>
                <th>Status</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map(a => (
                <tr key={a._id} onClick={() => router.push(`/paper/${a._id}`)} className={styles.tableRow}>
                  <td>
                    <div className={styles.titleCell}>
                      <span className={styles.mainTitle}>{a.title || `Assessment ${a._id.slice(-6)}`}</span>
                      <span className={styles.subId}>ID: {a._id.slice(-8)}</span>
                    </div>
                  </td>
                  <td>{a.subject || 'General'}</td>
                  <td>
                    <div className={styles.dateCell}>
                      <Calendar size={14} />
                      {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>{a.totalQuestions} Qs ({a.totalMarks} Marks)</td>
                  <td>
                    <span className={styles.statusBadge} data-status={a.status}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <div className={styles.actions}>
                      <button className={styles.iconBtn} onClick={(e) => { e.stopPropagation(); router.push(`/paper/${a._id}`); }}>
                        <Eye size={18} />
                      </button>
                      <button className={`${styles.iconBtn} ${styles.dangerBtn}`} onClick={(e) => handleDelete(e, a._id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
