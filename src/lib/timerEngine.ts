export interface TimerCallbacks {
  onTick: (remaining: number) => void;
  onDone: () => void;
}

export interface Timer {
  status: 'idle' | 'running' | 'paused' | 'finished';
  remainingSeconds: number;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  restart: (newIntervalSeconds: number) => void;
}

/**
 * Create a drift-free timer that uses Date.now() to compute remaining time
 * - Ticks every 250ms or 500ms (configurable)
 * - Uses system clock to avoid drift
 * - Works even if tab is backgrounded
 */
export function createTimer(
  intervalSeconds: number,
  callbacks: TimerCallbacks,
  tickIntervalMs: number = 250
): Timer {
  let endTime = Date.now() + intervalSeconds * 1000;
  let status: 'idle' | 'running' | 'paused' | 'finished' = 'running';
  let intervalId: number | null = null;
  let pausedRemaining = 0;

  const tick = () => {
    if (status !== 'running') return;

    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

    callbacks.onTick(remaining);

    if (remaining <= 0) {
      status = 'finished';
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      callbacks.onDone();
    }
  };

  const start = () => {
    if (status !== 'idle' && status !== 'paused') return;

    status = 'running';
    // Recalculate endTime if resuming from pause
    if (pausedRemaining > 0) {
      endTime = Date.now() + pausedRemaining * 1000;
      pausedRemaining = 0;
    }

    if (intervalId === null) {
      // For SSR compatibility, check if we have access to setInterval
      if (typeof window !== 'undefined') {
        intervalId = window.setInterval(tick, tickIntervalMs);
      }
    }
    tick(); // Immediate tick for responsiveness
  };

  const timer: Timer = {
    get status() {
      return status;
    },
    get remainingSeconds() {
      if (status === 'paused') {
        return pausedRemaining;
      }
      const now = Date.now();
      return Math.max(0, Math.ceil((endTime - now) / 1000));
    },
    pause: () => {
      if (status !== 'running') return;
      status = 'paused';
      pausedRemaining = timer.remainingSeconds;
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
    resume: () => {
      if (status !== 'paused') return;
      start();
    },
    stop: () => {
      status = 'finished';
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
    restart: (newIntervalSeconds: number) => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      endTime = Date.now() + newIntervalSeconds * 1000;
      status = 'idle';
      pausedRemaining = 0;
      start();
    },
  };

  // Start immediately
  start();

  return timer;
}
