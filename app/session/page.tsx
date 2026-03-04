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

        setPreset(selectedPreset);
        setQueue(builtQueue);
        setIsLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load session';
        setError(message);
        setIsLoading(false);
      }
    };

    initSession();
  }, [router]);

  const handleSessionEnd = (totalSeconds: number) => {
    // Store the result and navigate to results page
    sessionStorage.setItem(
      'sessionResult',
      JSON.stringify({ totalSeconds, completed: true })
    );
    router.push('/results');
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

  return <SessionRunner queue={queue} onSessionEnd={handleSessionEnd} />;
}
