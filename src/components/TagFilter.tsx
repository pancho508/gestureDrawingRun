'use client';

import { useState } from 'react';
import { normalizeTags } from '@/lib/normalize';

interface TagFilterProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagFilter({ value, onChange }: TagFilterProps) {
  const [input, setInput] = useState('');

  const handleAddTag = () => {
    if (!input.trim()) return;
    const newTags = normalizeTags([...value, input]);
    onChange(newTags);
    setInput('');
  };

  const handleRemoveTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleCommaInput = (text: string) => {
    if (text.includes(',')) {
      const parts = text.split(',').map((p) => p.trim()).filter(Boolean);
      const newTags = normalizeTags([...value, ...parts]);
      onChange(newTags);
      setInput('');
    } else {
      setInput(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Tags (Optional)
      </label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Add tags, comma-separated"
          value={input}
          onChange={(e) => handleCommaInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddTag}
          className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium transition-colors"
        >
          Add
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <div
              key={tag}
              className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-blue-700 font-semibold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
