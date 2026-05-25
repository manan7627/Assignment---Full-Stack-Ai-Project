import { create } from 'zustand';

export interface QuestionType {
  id: string;
  name: string;
  count: number;
  marks: number;
}

export interface AssignmentState {
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions: string;
  assignmentId: string | null;
  status: 'IDLE' | 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  paperData: any | null;
  
  setDueDate: (date: string) => void;
  updateQuestionType: (id: string, count: number, marks: number) => void;
  setAdditionalInstructions: (instructions: string) => void;
  setStatus: (status: 'IDLE' | 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED') => void;
  setAssignmentId: (id: string) => void;
  setPaperData: (data: any) => void;
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
  questionTypes: initialQuestionTypes,
  additionalInstructions: '',
  assignmentId: null,
  status: 'IDLE',
  paperData: null,

  setDueDate: (date) => set({ dueDate: date }),
  updateQuestionType: (id, count, marks) => set((state) => ({
    questionTypes: state.questionTypes.map((qt) =>
      qt.id === id ? { ...qt, count, marks } : qt
    )
  })),
  setAdditionalInstructions: (instructions) => set({ additionalInstructions: instructions }),
  setStatus: (status) => set({ status }),
  setAssignmentId: (id) => set({ assignmentId: id }),
  setPaperData: (data) => set({ paperData: data }),
  reset: () => set({ 
    dueDate: '', 
    questionTypes: initialQuestionTypes, 
    additionalInstructions: '', 
    assignmentId: null, 
    status: 'IDLE', 
    paperData: null 
  }),
}));
