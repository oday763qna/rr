export type PomodoroMode = 'focus' | 'short' | 'long';

export type FocusTimerSnapshot = {
  running: boolean;
  seconds: number;
  endsAt: number | null;
  mode: PomodoroMode;
  taskId: string | null;
};

const STORAGE_KEY = 'od-tasks:focus-timer:v1';

const emptySnapshot = (): FocusTimerSnapshot => ({
  running: false,
  seconds: 0,
  endsAt: null,
  mode: 'focus',
  taskId: null,
});

export function restoreFocusTimer(now = Date.now()): FocusTimerSnapshot {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return emptySnapshot();

    const stored = JSON.parse(value) as Partial<FocusTimerSnapshot>;
    const mode: PomodoroMode = stored.mode === 'short' || stored.mode === 'long' ? stored.mode : 'focus';
    const taskId = typeof stored.taskId === 'string' ? stored.taskId : null;
    const isRunning = stored.running === true && Number.isFinite(stored.endsAt);
    const endsAt = isRunning ? Number(stored.endsAt) : null;
    const seconds = isRunning
      ? Math.max(0, Math.ceil((Number(endsAt) - now) / 1000))
      : Math.max(0, Math.floor(Number(stored.seconds) || 0));

    return { running: isRunning, seconds, endsAt, mode, taskId };
  } catch {
    return emptySnapshot();
  }
}

export function saveFocusTimer(snapshot: FocusTimerSnapshot) {
  try {
    if (!snapshot.running && snapshot.seconds <= 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // The timer still works for the active page if storage is unavailable.
  }
}
