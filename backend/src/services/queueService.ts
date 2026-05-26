import { EventEmitter } from 'events';
import { generateAssessmentPaper } from './aiService';
import Assignment from '../models/Assignment';
import { broadcastStatus } from './websocketService';

class InMemoryQueue extends EventEmitter {
  private queue: any[] = [];
  private isProcessing: boolean = false;

  async add(jobName: string, data: any) {
    const job = { id: Date.now().toString(), name: jobName, data };
    this.queue.push(job);
    console.log(`Job added to queue: ${job.id}`);
    
    setTimeout(() => this.processNext(), 0);
    return job;
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const job = this.queue.shift();
    if (!job) {
      this.isProcessing = false;
      return;
    }

    try {
      console.log(`Processing job: ${job.id}`);
      
      const { assignmentId } = job.data;
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new Error("Assignment not found");

      if (!assignment.title) {
        assignment.title = `Assessment - ${new Date(assignment.dueDate).toLocaleDateString()}`;
      }

      assignment.status = 'GENERATING';
      await assignment.save();
      broadcastStatus(assignmentId, 'GENERATING');

      const sections = await generateAssessmentPaper(
        assignment.totalQuestions,
        assignment.totalMarks,
        assignment.questionTypes,
        assignment.additionalInstructions,
        assignment.subject || 'General',
        assignment.grade || '8th',
        assignment.fileContent || ''
      );

      assignment.sections = sections;
      assignment.status = 'COMPLETED';
      await assignment.save();
      broadcastStatus(assignmentId, 'COMPLETED', { sections });

      console.log(`Job completed: ${job.id}`);
    } catch (error: any) {
      console.error(`Job failed: ${job.id}`, error);
      const { assignmentId } = job.data;
      if (assignmentId) {
        await Assignment.findByIdAndUpdate(assignmentId, { status: 'FAILED', error: error.message });
        broadcastStatus(assignmentId, 'FAILED', { error: error.message });
      }
    } finally {
      this.isProcessing = false;
      this.processNext();
    }
  }
}

export const assessmentQueue = new InMemoryQueue();
