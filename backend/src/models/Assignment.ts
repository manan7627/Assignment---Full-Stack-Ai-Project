import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAssignment extends Document {
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  title: string;
  subject: string;
  grade: string;
  fileContent: string;
  dueDate: Date;
  questionTypes: string[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions: string;
  sections: ISection[];
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema = new Schema({
  text: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['Easy', 'Moderate', 'Challenging'] },
  marks: { type: Number, required: true }
});

const SectionSchema: Schema = new Schema({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: { type: [QuestionSchema], required: true }
});

const AssignmentSchema: Schema = new Schema({
  status: { type: String, enum: ['PENDING', 'GENERATING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  title: { type: String, default: '' },
  subject: { type: String, default: 'General' },
  grade: { type: String, default: '8th' },
  fileContent: { type: String, default: '' },
  dueDate: { type: Date, required: true },
  questionTypes: { type: [String], required: true },
  totalQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  additionalInstructions: { type: String, default: '' },
  sections: { type: [SectionSchema], default: [] },
  error: { type: String }
}, { timestamps: true });

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
