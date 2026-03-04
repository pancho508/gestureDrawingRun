'use client';

import { useState, useEffect } from 'react';
import { SessionPresetRecord } from '@/lib/db/schema';

export default function AdminPresetsPage() {
  const [presets, setPresets] = useState<SessionPresetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    intervalsSeconds: '30,30,30,30,30',
    defaultCategory: '',
  });

  // Fetch presets
  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/presets');
      if (!res.ok) throw new Error('Failed to fetch presets');
      const data = await res.json();
      setPresets(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const intervals = formData.intervalsSeconds
        .split(',')
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n) && n > 0);

      if (intervals.length === 0) {
        setError('Intervals must contain at least one positive number');
        return;
      }

      const body = {
        name: formData.name,
        intervalsSeconds: intervals,
        defaultCategory: formData.defaultCategory || null,
      };

      const res = editingId
        ? await fetch(`/api/admin/presets/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/admin/presets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save preset');
      }

      await fetchPresets();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        intervalsSeconds: '30,30,30,30,30',
        defaultCategory: '',
      });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (preset: SessionPresetRecord) => {
    setFormData({
      name: preset.name,
      intervalsSeconds: preset.intervalsSeconds.join(','),
      defaultCategory: preset.defaultCategory || '',
    });
    setEditingId(preset.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this preset?')) return;
    try {
      const res = await fetch(`/api/admin/presets/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete preset');
      await fetchPresets();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Session Presets</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: '',
              intervalsSeconds: '30,30,30,30,30',
              defaultCategory: '',
            });
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Preset
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">
            {editingId ? 'Edit Preset' : 'New Preset'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Preset Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., Quick Warmup"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Intervals (seconds, comma-separated)
              </label>
              <input
                type="text"
                value={formData.intervalsSeconds}
                onChange={(e) =>
                  setFormData({ ...formData, intervalsSeconds: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                placeholder="30,30,30,30,30"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: 30,30,30 creates 3 intervals of 30 seconds each
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Default Category (optional)</label>
              <select
                value={formData.defaultCategory}
                onChange={(e) =>
                  setFormData({ ...formData, defaultCategory: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
              >
                <option value="">None</option>
                <option value="figure">Figure</option>
                <option value="hands">Hands</option>
                <option value="faces">Faces</option>
                <option value="animals">Animals</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Presets List */}
      {loading ? (
        <p>Loading presets...</p>
      ) : presets.length === 0 ? (
        <p className="text-gray-500">No presets yet. Create one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presets.map((preset) => (
            <div key={preset.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-bold mb-3">{preset.name}</h3>

              <div className="space-y-2 text-sm mb-4">
                <p>
                  <strong>Intervals:</strong> {preset.intervalsSeconds.join(', ')} seconds
                </p>
                <p>
                  <strong>Total Duration:</strong> {preset.intervalsSeconds.reduce((a, b) => a + b, 0)} seconds ({Math.round(preset.intervalsSeconds.reduce((a, b) => a + b, 0) / 60 * 10) / 10} min)
                </p>
                <p>
                  <strong>Default Category:</strong>{' '}
                  {preset.defaultCategory || 'None'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(preset)}
                  className="flex-1 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(preset.id)}
                  className="flex-1 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
