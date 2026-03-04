import { SessionStats } from '@/types/session';

const STATS_KEY = 'loa-trainer-stats';

/**
 * Get current stats from localStorage
 */
export function getStats(): SessionStats {
  if (typeof window === 'undefined') {
    return {
      totalSecondsPracticed: 0,
      sessionsCompleted: 0,
    };
  }

  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (!stored) {
      return {
        totalSecondsPracticed: 0,
        sessionsCompleted: 0,
      };
    }
    return JSON.parse(stored);
  } catch {
    return {
      totalSecondsPracticed: 0,
      sessionsCompleted: 0,
    };
  }
}

/**
 * Save stats to localStorage
 */
export function saveStats(stats: SessionStats): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Update stats after a session
 */
export function updateStatsAfterSession(sessionSeconds: number): SessionStats {
  const current = getStats();
  const updated: SessionStats = {
    totalSecondsPracticed: current.totalSecondsPracticed + sessionSeconds,
    sessionsCompleted: current.sessionsCompleted + 1,
    lastSessionSeconds: sessionSeconds,
  };
  saveStats(updated);
  return updated;
}
