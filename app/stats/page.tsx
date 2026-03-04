'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SessionRun {
  id: string;
  category: string;
  totalSeconds: number;
  imagesCount: number;
  completedAt: string;
}

interface DatabaseStats {
  totalSessions: number;
  totalSeconds: number;
  totalImages: number;
  averageSeconds: number;
  lastSessionAt: string | null;
  byCategory: Array<{
    category: string;
    count: number;
    totalSeconds: number;
  }>;
}

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [sessions, setSessions] = useState<SessionRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsRes = await fetch('/api/stats');
        if (!statsRes.ok) {
          throw new Error('Failed to fetch stats');
        }
        const statsData = await statsRes.json();
        setStats(statsData.stats);

        // TODO: Fetch session history from /api/session/history when implemented
        // For now, use empty array
        setSessions([]);

        setIsLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load stats';
        setError(message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalMinutes = Math.floor((stats?.totalSeconds || 0) / 60);
  const totalSecondsRemainder = (stats?.totalSeconds || 0) % 60;
  const avgMinutes = Math.floor((stats?.averageSeconds || 0) / 60);
  const avgSecondsRemainder = (stats?.averageSeconds || 0) % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">📊 Statistics</h1>
          <Link href="/">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              ← Home
            </button>
          </Link>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stats?.totalSessions || 0}
              </div>
              <p className="text-gray-600">Total Sessions</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {totalMinutes}m {totalSecondsRemainder}s
              </div>
              <p className="text-gray-600">Total Practice Time</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats?.totalImages || 0}
              </div>
              <p className="text-gray-600">Images Drawing</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {avgMinutes}m {avgSecondsRemainder}s
              </div>
              <p className="text-gray-600">Average Session</p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {stats?.byCategory && stats.byCategory.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Practice by Category</h2>
            <div className="space-y-4">
              {stats.byCategory.map((cat) => {
                const minutes = Math.floor(cat.totalSeconds / 60);
                const seconds = cat.totalSeconds % 60;
                const percent =
                  stats.totalSessions > 0
                    ? Math.round((cat.count / stats.totalSessions) * 100)
                    : 0;
                return (
                  <div key={cat.category} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900 capitalize">
                        {cat.category}
                      </span>
                      <span className="text-sm text-gray-600">
                        {cat.count} sessions • {minutes}m {seconds}s
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Last Session Info */}
        {stats?.lastSessionAt && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <p className="text-gray-700">
              Last session:{' '}
              <strong>
                {new Date(stats.lastSessionAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
