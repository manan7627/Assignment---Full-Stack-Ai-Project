import { create } from 'zustand';

export interface QuestionType {
  id: string;
  name: string;
  count: number;
  marks: number;
}

export interface AssignmentState {
  dueDate: string;
  subject: string;
  grade: string;
  questionTypes: QuestionType[];
  additionalInstructions: string;
  assignmentId: string | null;
  status: 'IDLE' | 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  paperData: any | null;
  uploadedFile: File | null;
  uploadedFileName: string;
  
  setDueDate: (date: string) => void;
  setSubject: (subject: string) => void;
  setGrade: (grade: string) => void;
  updateQuestionType: (id: string, count: number, marks: number) => void;
  setAdditionalInstructions: (instructions: string) => void;
  setStatus: (status: 'IDLE' | 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED') => void;
  setAssignmentId: (id: string) => void;
  setPaperData: (data: any) => void;
  addQuestionType: () => void;
  removeQuestionType: (id: string) => void;
  setUploadedFile: (file: File | null) => void;
  reset: () => void;
}

const initialQuestionTypes: QuestionType[] = [
  { id: 'mcq', name: 'Multiple Choice Questions', count: 4, marks: 1 },
  { id: 'short', name: 'Short Questions', count: 3, marks: 2 },
  { id: 'diagram', name: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
  { id: 'numerical', name: 'Numerical Problems', count: 5, marks: 5 }
];

export const useAssignmentStore = create<AssignmentState>((set) => ({
  dueDate: '',
  subject: 'Science',
  grade: '8th',
  questionTypes: initialQuestionTypes,
  additionalInstructions: '',
  assignmentId: null,
  status: 'IDLE',
  paperData: null,
  uploadedFile: null,
  uploadedFileName: '',

  setDueDate: (date) => set({ dueDate: date }),
  setSubject: (subject) => set({ subject }),
  setGrade: (grade) => set({ grade }),
  updateQuestionType: (id, count, marks) => set((state) => ({
    questionTypes: state.questionTypes.map((qt) =>
      qt.id === id ? { ...qt, count, marks } : qt
    )
  })),
  setAdditionalInstructions: (instructions) => set({ additionalInstructions: instructions }),
  setStatus: (status) => set({ status }),
  setAssignmentId: (id) => set({ assignmentId: id }),
  setPaperData: (data) => set({ paperData: data }),
  addQuestionType: () => set((state) => ({
    questionTypes: [
      ...state.questionTypes,
      {
        id: `custom_${Date.now()}`,
        name: 'Custom Question',
        count: 1,
        marks: 1,
      }
    ]
  })),
  removeQuestionType: (id) => set((state) => {
    if (state.questionTypes.length <= 1) return state;
    return {
      questionTypes: state.questionTypes.filter((qt) => qt.id !== id)
    };
  }),
  setUploadedFile: (file) => set({
    uploadedFile: file,
    uploadedFileName: file ? file.name : '',
  }),
  reset: () => set({ 
    dueDate: '', 
    subject: 'Science',
    grade: '8th',
    questionTypes: initialQuestionTypes, 
    additionalInstructions: '', 
    assignmentId: null, 
    status: 'IDLE', 
    paperData: null,
    uploadedFile: null,
    uploadedFileName: '',
  }),
}));
