'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionStats } from '@/types';
import { getStats, updateStatsAfterSession } from '@/lib/localStats';

interface SessionResult {
  totalSeconds: number;
  completed: boolean;
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<SessionResult | null>(null);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get result from sessionStorage
    const resultStr = sessionStorage.getItem('sessionResult');
    if (!resultStr) {
      router.push('/');
      return;
    }

    const parsedResult: SessionResult = JSON.parse(resultStr);
    setResult(parsedResult);

    // Update and get stats
    const updatedStats = updateStatsAfterSession(parsedResult.totalSeconds);
    setStats(updatedStats);

    // Clear sessionStorage
    sessionStorage.removeItem('sessionParams');
    sessionStorage.removeItem('sessionResult');

    setIsLoading(false);
  }, [router]);

  if (isLoading || !result || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Loading results...</div>
      </div>
    );
  }

  const minutes = Math.floor(result.totalSeconds / 60);
  const seconds = result.totalSeconds % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            🎉 Session Complete!
          </h1>
        </div>

        {/* Results Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* Session Duration */}
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <p className="text-gray-600">Session duration</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.sessionsCompleted}
              </div>
              <p className="text-gray-600 text-sm">Total Sessions</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.floor(stats.totalSecondsPracticed / 60)}m{' '}
                {stats.totalSecondsPracticed % 60}s
              </div>
              <p className="text-gray-600 text-sm">Total Time Practiced</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition-colors"
            >
              → New Session
            </button>
            <button
              onClick={() => {
                // Reuse last session params
                const lastParams = sessionStorage.getItem('sessionParams');
                if (lastParams) {
                  sessionStorage.setItem('sessionParams', lastParams);
                  router.push('/session');
                } else {
                  router.push('/');
                }
              }}
              className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors"
            >
              ↻ Repeat Session
            </button>
          </div>

          {/* Encouragement */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-700">
              Great work! You've practiced for{' '}
              <strong>
                {Math.floor(stats.totalSecondsPracticed / 60)} minutes and{' '}
                {stats.totalSecondsPracticed % 60} seconds
              </strong>{' '}
              across <strong>{stats.sessionsCompleted} sessions</strong>. Keep it up! 💪
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
