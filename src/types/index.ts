export type PracticeStatus = 'unanswered' | 'correct' | 'incorrect';

export interface LiteraryTerm {
  id: string;
  term: string;
  explanation: string;
  exercise: string;
  answer: string;
  isDifficult: boolean;
  status: PracticeStatus;
  userAnswer: string;
}
