"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../components/Header';
import styles from './page.module.css';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAssignmentStore } from '../../../store/useAssignmentStore';

export default function Paper() {
  const { id } = useParams();
  const { status, setStatus, paperData, setPaperData } = useAssignmentStore();
  const paperRef = useRef<HTMLDivElement>(null);
  const [wsError, setWsError] = useState(false);

  useEffect(() => {
    // Fetch initial state
    const fetchAssignment = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/assignments/${id}`);
        const data = await res.json();
        if (data.status === 'COMPLETED') {
          setStatus('COMPLETED');
          setPaperData(data);
        } else {
          setStatus(data.status);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAssignment();

    // Setup WebSocket
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.assignmentId === id) {
        setStatus(data.status);
        if (data.status === 'COMPLETED' && data.sections) {
          setPaperData(data); // Using the data from WS
          // Trigger a fetch to get full assignment data
          fetchAssignment();
        } else if (data.status === 'FAILED') {
          alert('Generation failed: ' + data.error);
        }
      }
    };
    ws.onerror = () => setWsError(true);

    return () => ws.close();
  }, [id, setStatus, setPaperData]);

  const handleDownloadPDF = async () => {
    if (!paperRef.current) return;
    
    // Add print class to hide elements during canvas capture
    paperRef.current.classList.add(styles.isPrinting);
    
    try {
      const canvas = await html2canvas(paperRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
         orientation: 'portrait',
         unit: 'px',
         format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Assignment-${id}.pdf`);
    } catch (error) {
      console.error("PDF generation failed", error);
      alert("Failed to download PDF.");
    } finally {
      paperRef.current.classList.remove(styles.isPrinting);
    }
  };

  const handleRegenerate = async () => {
    setStatus('PENDING');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/assignments/${id}/regenerate`, { method: 'POST' });
      if (!res.ok) throw new Error('Regeneration failed');
    } catch (err) {
      console.error(err);
      alert('Failed to regenerate paper.');
      setStatus('FAILED');
    }
  };

  return (
    <div className={styles.container}>
      <Header title="Create New" />

      {status !== 'COMPLETED' && status !== 'FAILED' ? (
        <div className={styles.loaderWrapper}>
          <div className={styles.spinner}></div>
          <div className={styles.loaderText}>
            {status === 'PENDING' ? 'Added to Queue...' : 'Generating Assessment...'}
          </div>
          <div className={styles.loaderSubtext}>Please wait while our AI builds your perfect exam paper.</div>
          {wsError && <div style={{color: 'red', marginTop: '16px'}}>Live updates disconnected. Please refresh.</div>}
        </div>
      ) : paperData ? (
        <div className={styles.paperCard}>
          <div className={styles.paperHeader}>
            <div className={styles.headerText}>
              Certainly! Here is your customized Question Paper based on your instructions:
            </div>
            <div style={{display: 'flex', gap: '12px'}}>
              <button className={styles.secondaryBtn} onClick={handleRegenerate}>
                Regenerate
              </button>
              <button className={styles.downloadBtn} onClick={handleDownloadPDF}>
                <Download size={16} />
                Download as PDF
              </button>
            </div>
          </div>

          <div className={styles.paperContent} ref={paperRef}>
            <div className={styles.schoolHeader}>
              <div className={styles.schoolName}>Institution Assessment Paper</div>
              <div className={styles.subjectClass}>Subject: Science</div>
              <div className={styles.subjectClass}>Class: 8th</div>
            </div>

            <div className={styles.metaInfo}>
              <span>Time Allowed: {paperData.additionalInstructions?.includes('duration') ? '2 Hours' : '45 minutes'}</span>
              <span>Maximum Marks: {paperData.totalMarks}</span>
            </div>

            <div className={styles.instruction}>
              All questions are compulsory unless stated otherwise.
            </div>

            <div className={styles.studentDetails}>
              <div className={styles.inputLine}>Name: <div className={styles.line}></div></div>
              <div className={styles.inputLine}>Roll Number: <div className={styles.line}></div></div>
              <div className={styles.inputLine}>Class: 8th Section: <div className={styles.line}></div></div>
            </div>

            {paperData.sections?.map((section: any, sIdx: number) => (
              <div key={sIdx} className={styles.section}>
                <div className={styles.sectionTitle}>{section.title}</div>
                {section.instruction && (
                  <div className={styles.sectionInstruction}>{section.instruction}</div>
                )}
                
                <div className={styles.questionList}>
                  {section.questions.map((q: any, qIdx: number) => (
                    <div key={qIdx} className={styles.question}>
                      <span style={{minWidth: '24px'}}>{qIdx + 1}.</span>
                      <div className={styles.questionBody}>
                        <div className={styles.questionMeta}>
                          <span className={styles.difficultyTag} data-difficulty={q.difficulty.toLowerCase()}>{q.difficulty}</span>
                        </div>
                        <div className={styles.questionText}>
                           {q.text} <span className={styles.marks}>[{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className={styles.endMarker}>End of Question Paper</div>
          </div>
        </div>
      ) : (
        <div>No data found.</div>
      )}
    </div>
  );
}
