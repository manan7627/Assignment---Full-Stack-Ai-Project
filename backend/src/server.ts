import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import dotenv from 'dotenv';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { initWebSocket } from './services/websocketService';
import { assessmentQueue } from './services/queueService';
import Assignment from './models/Assignment';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
const server = createServer(app);

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Initialize WebSocket
initWebSocket(server);

// MongoDB connection
connectDB();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ 
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.txt', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stats endpoint (must be before /:id)
app.get('/api/assignments/stats', async (req, res) => {
  try {
    const total = await Assignment.countDocuments();
    const completed = await Assignment.countDocuments({ status: 'COMPLETED' });
    const pending = await Assignment.countDocuments({ status: 'PENDING' });
    const failed = await Assignment.countDocuments({ status: 'FAILED' });
    res.json({ total, completed, pending, failed });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    let extractedText = '';
    const ext = path.extname(req.file.originalname).toLowerCase();
    
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (ext === '.txt') {
      extractedText = fs.readFileSync(req.file.path, 'utf-8');
    }
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({ 
      fileName: req.file.originalname,
      extractedText: extractedText.substring(0, 5000), // limit
      success: true 
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// Create assignment
app.post('/api/assignments', async (req, res) => {
  try {
    const { dueDate, questionTypes, totalQuestions, totalMarks, additionalInstructions, fileContent, title, subject, grade } = req.body;

    const autoTitle = title || `Assessment - ${new Date(dueDate).toLocaleDateString()}`;

    const assignment = new Assignment({
      title: autoTitle,
      dueDate,
      subject: subject || 'General',
      grade: grade || '8th',
      questionTypes,
      totalQuestions,
      totalMarks,
      additionalInstructions,
      fileContent: fileContent || '',
      status: 'PENDING'
    });

    await assignment.save();

    // Add job to queue
    await assessmentQueue.add('generateAssessment', { assignmentId: assignment._id.toString() });

    res.status(201).json({ message: 'Assignment creation started', assignmentId: assignment._id });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

app.get('/api/assignments/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// Get all assignments
app.get('/api/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Delete assignment
app.delete('/api/assignments/:id', async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// Regenerate assignment
app.post('/api/assignments/:id/regenerate', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    assignment.status = 'PENDING';
    await assignment.save();

    await assessmentQueue.add('generateAssessment', { assignmentId: assignment._id.toString() });

    res.json({ message: 'Regeneration started', assignmentId: assignment._id });
  } catch (error) {
    console.error('Error regenerating:', error);
    res.status(500).json({ error: 'Failed to regenerate assignment' });
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
