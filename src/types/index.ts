export type PracticeStatus = 'unanswered' | 'correct' | 'incorrect';

export interface LiteraryTerm {
  id: number;
  term: string;
  explanation: string;
  exercise: string;
  answer: Record<string, string>;
  isDifficult: boolean;
  status: PracticeStatus | Record<string, PracticeStatus>;
  userAnswer: Record<string, string>;
  createdAt: Date;
  groupName: string | null;
}

export type LiteraryTermCreate = Omit<LiteraryTerm, 'id' | 'createdAt' | 'status'> & {
    status: 'unanswered';
};


export interface TermGroup {
    groupName: string;
    count: number;
}
