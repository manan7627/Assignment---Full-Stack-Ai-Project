"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from './components/Header';
import styles from './page.module.css';
import { CloudUpload, Calendar, ChevronDown, X, Mic, ArrowLeft, ArrowRight, Plus, FileText, Activity } from 'lucide-react';
import { useAssignmentStore } from '../store/useAssignmentStore';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    dueDate, 
    setDueDate, 
    subject,
    setSubject,
    grade,
    setGrade,
    questionTypes, 
    updateQuestionType, 
    additionalInstructions, 
    setAdditionalInstructions,
    setAssignmentId,
    setStatus,
    addQuestionType,
    removeQuestionType,
    uploadedFile,
    uploadedFileName,
    setUploadedFile
  } = useAssignmentStore();

  const [view, setView] = useState<'dashboard' | 'create'>('dashboard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get('view') === 'create') {
      setView('create');
    }
    fetchAssignments();
  }, [searchParams]);

  const fetchAssignments = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/assignments`);
      const data = await res.json();
      setRecentAssignments(data);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/assignments/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAssignments();
    } catch (err) {
      console.error('Failed to delete assignment:', err);
    }
  };

  const totalQuestions = questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const totalMarks = questionTypes.reduce((sum, qt) => sum + (qt.count * qt.marks), 0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { 
      alert('Speech recognition is not supported in this browser.'); 
      return; 
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setAdditionalInstructions(additionalInstructions + (additionalInstructions ? ' ' : '') + text);
    };
    recognition.start();
  };

  const handleGenerate = async () => {
    if (!dueDate || totalQuestions === 0) {
      alert("Please enter a due date and ensure there is at least one question.");
      return;
    }

    setIsSubmitting(true);
    setStatus('PENDING');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      let fileContent = '';
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        try {
          const uploadRes = await fetch(`${apiUrl}/api/upload`, {
            method: 'POST',
            body: formData
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            fileContent = uploadData.extractedText || '';
          }
        } catch (uploadErr) {
          console.error("Upload failed, continuing without file content", uploadErr);
        }
      }

      const response = await fetch(`${apiUrl}/api/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dueDate,
          questionTypes: questionTypes.map(qt => qt.name),
          totalQuestions,
          totalMarks,
          additionalInstructions,
          fileContent,
          fullQuestionTypes: questionTypes,
          subject,
          grade
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setAssignmentId(data.assignmentId);
        router.push(`/paper/${data.assignmentId}`);
      } else {
        alert(data.error || "Failed to start generation");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server. Is the backend running?");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header title={view === 'dashboard' ? 'Dashboard' : 'Create Assignment'} />
      
      {view === 'dashboard' ? (
        <div className={styles.dashboard}>
          <div className={styles.pageHeader}>
            <div className={styles.pageTitle}>
              <Activity size={24} color="var(--accent-orange)" />
              Teacher Dashboard
            </div>
            <div className={styles.pageSubtitle}>Welcome back! Here is an overview of your assessments.</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '40px' }}>
             <div className={styles.card} style={{ padding: '24px' }}>
                <h3 style={{fontSize: 14, color: 'var(--text-secondary)'}}>Total Assessments</h3>
                <p style={{fontSize: 32, fontWeight: 'bold', marginTop: 8}}>{recentAssignments.length}</p>
             </div>
             <div className={styles.card} style={{ padding: '24px' }}>
                <h3 style={{fontSize: 14, color: 'var(--text-secondary)'}}>Students Enrolled</h3>
                <p style={{fontSize: 32, fontWeight: 'bold', marginTop: 8}}>--</p>
             </div>
             <div className={styles.card} style={{ padding: '24px', background: 'var(--btn-dark)', color: 'white', cursor: 'pointer' }} onClick={() => setView('create')}>
                <h3 style={{fontSize: 16, color: 'white', display: 'flex', alignItems: 'center', gap: 8}}>
                  <Plus size={20} /> Create New Assessment
                </h3>
                <p style={{fontSize: 14, color: '#aaa', marginTop: 8}}>Use AI to generate a structured exam paper instantly.</p>
             </div>
          </div>

          <h2 style={{fontSize: 18, marginBottom: 16}}>Recent Assignments</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            {recentAssignments.map(a => (
              <div key={a._id} className={styles.card} style={{padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}} onClick={() => router.push(`/paper/${a._id}`)}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                  <div style={{padding: 12, background: '#f5f5f5', borderRadius: 12}}>
                    <FileText size={20} color="var(--accent-orange)" />
                  </div>
                  <div>
                    <h4 style={{fontSize: 16}}>Assessment {a._id.slice(-6)}</h4>
                    <p style={{fontSize: 13, color: 'var(--text-secondary)'}}>Questions: {a.totalQuestions} | Marks: {a.totalMarks}</p>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                  <div style={{fontSize: 13, fontWeight: 'bold', color: a.status === 'COMPLETED' ? '#4CAF50' : a.status === 'FAILED' ? '#F44336' : '#FF9800'}}>{a.status}</div>
                  <X size={18} color="#999" onClick={(e) => handleDelete(e, a._id)} className={styles.deleteBtn} />
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        <>
          <div className={styles.pageHeader}>
            <div className={styles.pageTitle}>
              <div style={{width: 8, height: 8, background: '#4CAF50', borderRadius: '50%'}}></div>
              Create Assignment
            </div>
            <div className={styles.pageSubtitle}>Set up a new assignment for your students</div>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>Assignment Details</div>
            <div className={styles.sectionSubtitle}>Basic information about your assignment</div>

            <div className={styles.uploadZone} 
                 onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add(styles.uploadZoneActive); }}
                 onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove(styles.uploadZoneActive); }}
                 onDrop={(e) => {
                   e.preventDefault();
                   e.currentTarget.classList.remove(styles.uploadZoneActive);
                   if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                     setUploadedFile(e.dataTransfer.files[0]);
                   }
                 }}>
              <input type="file" ref={fileInputRef} style={{display: 'none'}} accept=".pdf,.txt,.png,.jpg,.jpeg" onChange={handleFileSelect} />
              
              {!uploadedFile ? (
                <>
                  <CloudUpload size={32} color="var(--text-primary)" />
                  <div className={styles.uploadText}>Choose a file or drag & drop it here</div>
                  <div className={styles.uploadSubtext}>JPEG, PNG, PDF, TXT upto 10MB</div>
                  <button className={styles.browseBtn} onClick={() => fileInputRef.current?.click()}>Browse Files</button>
                </>
              ) : (
                <div className={styles.filePreview}>
                  <FileText size={24} color="var(--accent-orange)" />
                  <div style={{flex: 1, wordBreak: 'break-all'}}>
                    <div style={{fontWeight: 600, fontSize: 14}}>{uploadedFileName}</div>
                    <div style={{fontSize: 12, color: 'var(--text-secondary)'}}>Ready to process</div>
                  </div>
                  <X size={20} color="var(--text-secondary)" style={{cursor: 'pointer'}} onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }} />
                </div>
              )}
            </div>
            <div className={styles.uploadHint}>Upload documents (syllabus/notes) to guide AI generation</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label className={styles.label}>Subject</label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="text" 
                    className={styles.dateInput} 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Science, Mathematics, English"
                  />
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label className={styles.label}>Class / Grade</label>
                <div className={styles.inputWrapper}>
                  <input 
                    type="text" 
                    className={styles.dateInput} 
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. 8th, 10th, 12th"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Due Date</label>
              <div className={styles.inputWrapper}>
                <input 
                  type="date" 
                  className={styles.dateInput} 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="DD-MM-YYYY"
                />
              </div>
            </div>

            <div className={styles.gridHeader}>
              <div className={styles.gridHeaderTitle}>Question Type</div>
              <div className={styles.gridHeaderTitle} style={{textAlign: 'center'}}>No. of Questions</div>
              <div className={styles.gridHeaderTitle} style={{textAlign: 'center'}}>Marks</div>
            </div>

            {questionTypes.map((qt) => (
              <div className={styles.questionRow} key={qt.id}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <div className={styles.typeSelect} style={{flex: 1}}>
                    {qt.name}
                    <ChevronDown size={16} />
                  </div>
                  <X size={16} color="var(--text-secondary)" style={{cursor: 'pointer'}} onClick={(e) => { e.stopPropagation(); removeQuestionType(qt.id); }} />
                </div>
                
                <div className={styles.stepper}>
                  <button className={styles.stepperBtn} onClick={() => updateQuestionType(qt.id, Math.max(0, qt.count - 1), qt.marks)}>-</button>
                  <span className={styles.stepperValue}>{qt.count}</span>
                  <button className={styles.stepperBtn} onClick={() => updateQuestionType(qt.id, qt.count + 1, qt.marks)}>+</button>
                </div>

                <div className={styles.stepper}>
                  <button className={styles.stepperBtn} onClick={() => updateQuestionType(qt.id, qt.count, Math.max(0, qt.marks - 1))}>-</button>
                  <span className={styles.stepperValue}>{qt.marks}</span>
                  <button className={styles.stepperBtn} onClick={() => updateQuestionType(qt.id, qt.count, qt.marks + 1)}>+</button>
                </div>
              </div>
            ))}

            <button className={styles.addTypeBtn} onClick={addQuestionType}>
              <div className={styles.addIcon}><Plus size={16} /></div>
              Add Question Type
            </button>

            <div className={styles.summary}>
              <div>Total Questions : {totalQuestions}</div>
              <div>Total Marks : {totalMarks}</div>
            </div>

            <div className={styles.formGroup} style={{marginTop: '32px'}}>
              <label className={styles.label}>Additional Information (For better output)</label>
              <div style={{position: 'relative'}}>
                <textarea 
                  className={styles.textarea}
                  placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                />
                <Mic 
                  className={`${styles.micIcon} ${isRecording ? styles.recording : ''}`} 
                  size={20} 
                  onClick={handleVoiceInput}
                  style={{cursor: 'pointer'}}
                />
              </div>
            </div>
          </div>

          <div className={styles.bottomBar}>
            <button className={styles.prevBtn} onClick={() => setView('dashboard')}>
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <button className={styles.nextBtn} onClick={handleGenerate} disabled={isSubmitting}>
              {isSubmitting ? 'Generating...' : 'Next'}
              <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{padding: 24}}>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
