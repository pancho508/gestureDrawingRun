'use client';

import { Category } from '@/types';

interface CategoryPickerProps {
  value: Category;
  onChange: (category: Category) => void;
}

const CATEGORIES: { label: string; value: Category }[] = [
  { label: '👤 Figure', value: 'figure' },
  { label: '✋ Hands', value: 'hands' },
  { label: '😊 Faces', value: 'faces' },
  { label: '🦁 Animals', value: 'animals' },
];

export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Category
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.map(({ label, value: catValue }) => (
          <button
            key={catValue}
            onClick={() => onChange(catValue)}
            className={`p-3 rounded-lg font-medium transition-colors ${
              value === catValue
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
