export type PracticeStatus = 'unanswered' | 'correct' | 'incorrect';

export interface LiteraryTerm {
  id: number;
  term: string;
  explanation: string;
  exercise: string;
  answers: string[];
  isDifficult: boolean;
  status: PracticeStatus;
  userAnswers: string[];
  createdAt: Date;
  groupName: string | null;
}

export type LiteraryTermCreate = Omit<LiteraryTerm, 'id' | 'createdAt'>;

export interface TermGroup {
    groupName: string;
    count: number;
}
