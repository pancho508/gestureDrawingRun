'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category, ImageQueueItem, SessionPreset } from '@/types';
import { SessionRunner } from '@/components/SessionRunner';

interface SessionParams {
  presetId: string;
  category: Category;
  tags: string[];
  includeNsfw: boolean;
}

export default function SessionPage() {
  const router = useRouter();
  const [queue, setQueue] = useState<ImageQueueItem[]>([]);
  const [preset, setPreset] = useState<SessionPreset | null>(null);
  const [sessionRunId, setSessionRunId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        // Get params from sessionStorage
        const paramsStr = sessionStorage.getItem('sessionParams');
        if (!paramsStr) {
          router.push('/');
          return;
        }

        const params: SessionParams = JSON.parse(paramsStr);

        // Fetch presets from API
        const presetsRes = await fetch('/api/presets');
        if (!presetsRes.ok) {
          throw new Error('Failed to fetch presets');
        }
        const presets: SessionPreset[] = await presetsRes.json();

        // Find selected preset
        const selectedPreset = presets.find((p) => p.id === params.presetId);
        if (!selectedPreset) {
          throw new Error('Preset not found');
        }

        // Build query string for queue API
        const queryParams = new URLSearchParams({
          category: params.category,
          includeNsfw: String(params.includeNsfw),
          tags: params.tags.join(','),
          intervals: selectedPreset.intervalsSeconds.join(','),
        });

        // Fetch queue from API
        const queueRes = await fetch(`/api/images/queue?${queryParams.toString()}`);
        if (!queueRes.ok) {
          const errorData = await queueRes.json();
          throw new Error(errorData.error || 'Failed to build queue');
        }
        const builtQueue: ImageQueueItem[] = await queueRes.json();

        // Start session in database
        const sessionRes = await fetch('/api/session/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            presetId: params.presetId,
            category: params.category,
            tags: params.tags,
            includeNsfw: params.includeNsfw,
          }),
        });
        if (!sessionRes.ok) {
          throw new Error('Failed to start session');
        }
        const sessionData = await sessionRes.json();
        const runId = sessionData.sessionRunId;

        setPreset(selectedPreset);
        setQueue(builtQueue);
        setSessionRunId(runId);
        setIsLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load session';
        setError(message);
        setIsLoading(false);
      }
    };

    initSession();
  }, [router]);

  const handleSessionEnd = async (totalSeconds: number) => {
    try {
      // Finish session in database
      if (sessionRunId) {
        const finishRes = await fetch('/api/session/finish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionRunId,
            totalSeconds,
            images: queue.map((img) => ({
              referenceImageId: img.id,
              intervalSeconds: img.intervalSeconds,
            })),
          }),
        });
        if (!finishRes.ok) {
          console.error('Failed to finish session');
        }
      }

      // Store the result in sessionStorage for the results page
      sessionStorage.setItem(
        'sessionResult',
        JSON.stringify({ totalSeconds, completed: true })
      );
      router.push('/results');
    } catch (err) {
      console.error('Error ending session:', err);
      // Still navigate to results page even if DB update fails
      router.push('/results');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl font-bold mb-4">Loading session...</div>
          <div className="animate-spin">⏳</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl font-bold mb-4">Error</div>
          <p className="mb-6">{error}</p>
          <p className="text-sm opacity-70 mb-6">
            {error.includes('No images match')
              ? 'Try adjusting your filters (remove tags or enable NSFW)'
              : 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!queue.length || !preset) {
    return null;
  }

  return <SessionRunner queue={queue} sessionRunId={sessionRunId} onSessionEnd={handleSessionEnd} />;
}
