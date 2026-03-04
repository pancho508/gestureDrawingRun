'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Category, SessionPreset } from '@/types';
import { CategoryPicker } from '@/components/CategoryPicker';
import { PresetPicker } from '@/components/PresetPicker';
import { TagFilter } from '@/components/TagFilter';

export default function Home() {
  const router = useRouter();
  const [presets, setPresets] = useState<SessionPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState<Category>('figure');
  const [presetId, setPresetId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [includeNsfw, setIncludeNsfw] = useState(false);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await fetch('/api/presets');
        if (!response.ok) {
          throw new Error('Failed to fetch presets');
        }
        const data: SessionPreset[] = await response.json();
        setPresets(data);
        if (data.length > 0) {
          setPresetId(data[0].id);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Error fetching presets:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresets();
  }, []);

  const handleStartSession = () => {
    if (!presetId) return;

    // Store session params in sessionStorage for the session page
    const params = { presetId, category, tags, includeNsfw };
    sessionStorage.setItem('sessionParams', JSON.stringify(params));

    router.push('/session');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            LOA Trainer
          </h1>
          <p className="text-xl text-gray-600">
            Practice gesture drawing with timed reference images
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex justify-center gap-4 mb-8">
          <Link href="/stats">
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
              📊 View Stats
            </button>
          </Link>
          <Link href="/admin/login">
            <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
              ⚙️ Admin
            </button>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-medium">⚠️ Error loading data</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="text-gray-600">Loading presets...</div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            {/* Category */}
            <CategoryPicker value={category} onChange={setCategory} />

            {/* Preset */}
            {presets.length > 0 && (
              <PresetPicker
                presets={presets}
                value={presetId}
                onChange={setPresetId}
              />
            )}

            {/* Tags */}
            <TagFilter value={tags} onChange={setTags} />

            {/* NSFW Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="nsfw"
                checked={includeNsfw}
                onChange={(e) => setIncludeNsfw(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="nsfw" className="text-gray-700 font-medium">
                Include NSFW images
              </label>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartSession}
              disabled={!presetId}
              className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Start Session →
            </button>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-semibold mb-2">⌨️ Keyboard Shortcuts:</p>
              <p>Space: Pause/Resume | Arrow Keys: Navigate | R: Restart | H: Hide UI</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
