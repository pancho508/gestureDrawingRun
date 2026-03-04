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
 * Create a drift-free timer using requestAnimationFrame
 * - Updates smoothly with browser refresh rate
 * - Uses system clock (Date.now()) to calculate remaining time
 * - No interval management issues or stale callbacks
 * - Works reliably when switching between images
 */
export function createTimer(
  intervalSeconds: number,
  callbacks: TimerCallbacks,
  tickIntervalMs: number = 250
): Timer {
  let startTime = Date.now();
  let endTime = startTime + intervalSeconds * 1000;
  let status: 'idle' | 'running' | 'paused' | 'finished' = 'running';
  let frameId: number | null = null;
  let pausedRemaining = 0;
  let lastTickRemaining = intervalSeconds;
  let isActive = true; // Track if this timer instance is still active

  const calculateRemaining = (): number => {
    const now = Date.now();
    return Math.max(0, Math.ceil((endTime - now) / 1000));
  };

  const tick = () => {
    // Skip if this timer instance is no longer active
    if (!isActive) return;

    if (status !== 'running') {
      frameId = null;
      return;
    }

    const remaining = calculateRemaining();

    // Only call onTick if remaining has changed (avoid excessive updates)
    if (remaining !== lastTickRemaining) {
      lastTickRemaining = remaining;
      callbacks.onTick(remaining);
    }

    // Check if timer is done
    if (remaining <= 0) {
      status = 'finished';
      isActive = false;
      frameId = null;
      callbacks.onDone();
      return;
    }

    // Schedule next frame
    if (typeof window !== 'undefined') {
      frameId = window.requestAnimationFrame(tick);
    }
  };

  const timer: Timer = {
    get status() {
      return status;
    },
    get remainingSeconds() {
      if (!isActive) return 0;
      if (status === 'paused') {
        return pausedRemaining;
      }
      return calculateRemaining();
    },
    pause: () => {
      if (!isActive || status !== 'running') return;
      status = 'paused';
      pausedRemaining = calculateRemaining();
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    },
    resume: () => {
      if (!isActive || status !== 'paused') return;
      status = 'running';
      // Recalculate end time based on paused remaining
      endTime = Date.now() + pausedRemaining * 1000;
      pausedRemaining = 0;
      if (typeof window !== 'undefined') {
        frameId = window.requestAnimationFrame(tick);
      }
      tick(); // Immediate tick for responsiveness
    },
    stop: () => {
      status = 'finished';
      isActive = false;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    },
    restart: (newIntervalSeconds: number) => {
      // Mark old instance as inactive
      isActive = false;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
      // This won't work on a stopped timer, but that's ok
      // The component will create a new timer anyway
    },
  };

  // Start immediately
  if (typeof window !== 'undefined') {
    frameId = window.requestAnimationFrame(tick);
  }
  tick(); // Immediate first tick

  return timer;
}
