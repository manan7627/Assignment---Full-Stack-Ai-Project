import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { initWebSocket } from './services/websocketService';
import { assessmentQueue } from './services/queueService';
import Assignment from './models/Assignment';

dotenv.config();

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

// Initialize WebSocket
initWebSocket(server);

// MongoDB connection
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/veda-ai';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.post('/api/assignments', async (req, res) => {
  try {
    const { dueDate, questionTypes, totalQuestions, totalMarks, additionalInstructions } = req.body;

    const assignment = new Assignment({
      dueDate,
      questionTypes,
      totalQuestions,
      totalMarks,
      additionalInstructions,
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
