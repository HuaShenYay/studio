export type PracticeStatus = 'unanswered' | 'correct' | 'incorrect';

export interface LiteraryTerm {
  id: number;
  term: string;
  explanation: string;
  exercise: string;
  answer: string;
  isDifficult: boolean;
  status: PracticeStatus;
  userAnswer: string;
  createdAt: Date;
}

export type LiteraryTermCreate = Omit<LiteraryTerm, 'id' | 'createdAt'>;
