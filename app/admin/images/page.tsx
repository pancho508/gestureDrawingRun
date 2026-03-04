'use client';

import { useState, useEffect } from 'react';
import { ReferenceImageRecord } from '@/lib/db/schema';

export default function AdminImagesPage() {
  const [images, setImages] = useState<ReferenceImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    url: '',
    category: 'figure' as 'figure' | 'hands' | 'faces' | 'animals',
    tags: '',
    isNsfw: false,
  });

  // Fetch images
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/images');
      if (!res.ok) throw new Error('Failed to fetch images');
      const data = await res.json();
      setImages(data);
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
      const tags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const body = {
        url: formData.url,
        category: formData.category,
        tags,
        isNsfw: formData.isNsfw,
      };

      const res = editingId
        ? await fetch(`/api/admin/images/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/admin/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

      if (!res.ok) throw new Error('Failed to save image');

      await fetchImages();
      setShowForm(false);
      setEditingId(null);
      setFormData({ url: '', category: 'figure', tags: '', isNsfw: false });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (image: ReferenceImageRecord) => {
    setFormData({
      url: image.url,
      category: image.category as any,
      tags: image.tags.join(', '),
      isNsfw: image.isNsfw,
    });
    setEditingId(image.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      const res = await fetch(`/api/admin/images/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete image');
      await fetchImages();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reference Images</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ url: '', category: 'figure', tags: '', isNsfw: false });
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Image
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
            {editingId ? 'Edit Image' : 'New Image'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as any,
                  })
                }
                className="w-full border rounded px-3 py-2"
              >
                <option value="figure">Figure</option>
                <option value="hands">Hands</option>
                <option value="faces">Faces</option>
                <option value="animals">Animals</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="gesture, standing, anatomy"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isNsfw}
                onChange={(e) => setFormData({ ...formData, isNsfw: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm font-medium">Mark as NSFW</label>
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

      {/* Images Grid */}
      {loading ? (
        <p>Loading images...</p>
      ) : images.length === 0 ? (
        <p className="text-gray-500">No images yet. Create one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow p-4">
              <div className="mb-4 bg-gray-100 rounded aspect-video flex items-center justify-center overflow-hidden">
                <img
                  src={image.url}
                  alt={image.category}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ccc%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22%23999%22%3EImage Not Found%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>

              <div className="space-y-2 text-sm">
                <p>
                  <strong>Category:</strong> {image.category}
                </p>
                <p>
                  <strong>Tags:</strong> {image.tags.join(', ') || 'None'}
                </p>
                <p>
                  <strong>NSFW:</strong> {image.isNsfw ? '⚠️ Yes' : 'No'}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(image)}
                  className="flex-1 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(image.id)}
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
