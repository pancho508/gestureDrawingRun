'use client';

import { SessionPreset } from '@/types';

interface PresetPickerProps {
  presets: SessionPreset[];
  value: string;
  onChange: (presetId: string) => void;
}

export function PresetPicker({ presets, value, onChange }: PresetPickerProps) {
  const selectedPreset = presets.find((p) => p.id === value);
  const totalSeconds = selectedPreset
    ? selectedPreset.intervalsSeconds.reduce((a: number, b: number) => a + b, 0)
    : 0;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Session Preset
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        {presets.map((preset) => {
          const total = preset.intervalsSeconds.reduce((a: number, b: number) => a + b, 0);
          const minutes = Math.floor(total / 60);
          const seconds = total % 60;

          return (
            <button
              key={preset.id}
              onClick={() => onChange(preset.id)}
              className={`p-4 rounded-lg text-left font-medium transition-colors ${
                value === preset.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              <div className="font-semibold">{preset.name}</div>
              <div className="text-sm opacity-80">
                {total > 60
                  ? `${minutes}m ${seconds}s`
                  : `${total}s`}
                {' '}
                ({preset.intervalsSeconds.length} poses)
              </div>
            </button>
          );
        })}
      </div>
      {selectedPreset && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
          <strong>{selectedPreset.name}</strong>: {totalSeconds} total seconds
        </div>
      )}
    </div>
  );
}
