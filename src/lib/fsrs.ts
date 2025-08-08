export type FsrsState = {
  stabilityDays: number; // current stability (approximate interval in days)
  difficulty: number; // 1.0 (easy) to 10.0 (hard)
  scheduledAt: string; // ISO time when next review is due
  lastReviewedAt: string | null; // ISO last review time
  reps: number; // successful reviews count
  lapses: number; // failures count
};

export type FsrsGrade = 'again' | 'hard' | 'good' | 'easy';

export function nowIso(d: Date = new Date()): string {
  return d.toISOString();
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + Math.max(-3650, Math.min(3650, Math.round(days))));
  return result;
}

export function isDue(state: FsrsState | null | undefined, at: Date = new Date()): boolean {
  if (!state) return true; // treat as due if no state
  return new Date(state.scheduledAt).getTime() <= at.getTime();
}

export function initFsrs(at: Date = new Date()): FsrsState {
  return {
    stabilityDays: 1,
    difficulty: 6.0,
    scheduledAt: nowIso(at),
    lastReviewedAt: null,
    reps: 0,
    lapses: 0,
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// A lightweight FSRS-like update (heuristic):
// - difficulty drifts with feedback
// - stability increases multiplicatively on success, decays on failure
// - schedule = now + stabilityDays
export function reviewFsrs(prev: FsrsState | null | undefined, grade: FsrsGrade, at: Date = new Date()): FsrsState {
  const s = prev ?? initFsrs(at);
  let stability = s.stabilityDays;
  let difficulty = s.difficulty;

  const gradeFactor = {
    again: 0.5,
    hard: 0.8,
    good: 1.8,
    easy: 2.5,
  }[grade];

  // difficulty update: lower for good/easy, higher for again/hard
  const diffDelta = {
    again: +1.0,
    hard: +0.4,
    good: -0.3,
    easy: -0.6,
  }[grade];
  difficulty = clamp(difficulty + diffDelta, 1.0, 10.0);

  // stability update
  if (grade === 'again') {
    stability = Math.max(1, Math.round(stability * gradeFactor));
  } else {
    stability = Math.max(1, Math.round(stability * gradeFactor + (10 - difficulty) * 0.2));
  }

  const next = addDays(at, stability);
  return {
    stabilityDays: stability,
    difficulty,
    scheduledAt: nowIso(next),
    lastReviewedAt: nowIso(at),
    reps: s.reps + (grade === 'again' ? 0 : 1),
    lapses: s.lapses + (grade === 'again' ? 1 : 0),
  };
}

export function readFsrsFromUserAnswer(userAnswer: Record<string, any> | undefined | null): FsrsState | null {
  const raw = (userAnswer as any)?.__fsrs;
  if (!raw) return null;
  try {
    // basic shape check
    if (typeof raw === 'object' && raw.scheduledAt) return raw as FsrsState;
    return null;
  } catch {
    return null;
  }
}

export function writeFsrsToUserAnswer(userAnswer: Record<string, any> | undefined | null, state: FsrsState): Record<string, any> {
  const next = { ...(userAnswer ?? {}) } as Record<string, any>;
  next.__fsrs = state;
  return next;
}



