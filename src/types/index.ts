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
  groupName: string | null;
}

export type LiteraryTermCreate = Omit<LiteraryTerm, 'id' | 'createdAt'>;

export interface TermGroup {
    groupName: string;
    count: number;
}
