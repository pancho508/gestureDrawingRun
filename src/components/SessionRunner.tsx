'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ImageQueueItem } from '@/types';
import { createTimer } from '@/lib/timerEngine';

interface SessionRunnerProps {
  queue: ImageQueueItem[];
  sessionRunId: string | null;
  onSessionEnd: (totalSeconds: number) => void;
}

export function SessionRunner({ queue, sessionRunId, onSessionEnd }: SessionRunnerProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(queue[0]?.intervalSeconds || 0);
  const [status, setStatus] = useState<'running' | 'paused' | 'finished'>('running');
  const [hideUi, setHideUi] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const timerRef = useRef<ReturnType<typeof createTimer> | null>(null);
  const preloadedImages = useRef(new Set<string>());

  // Preload next images
  useEffect(() => {
    const preloadImage = (url: string) => {
      if (preloadedImages.current.has(url)) return;
      const img = new Image();
      img.src = url;
      preloadedImages.current.add(url);
    };

    // Preload current, next, and next+1
    if (queue[index]) preloadImage(queue[index].url);
    if (queue[index + 1]) preloadImage(queue[index + 1].url);
    if (queue[index + 2]) preloadImage(queue[index + 2].url);
  }, [index, queue]);

  // Initialize timer
  useEffect(() => {
    // Stop old timer
    if (timerRef.current) {
      timerRef.current.stop();
      timerRef.current = null;
    }

    // Check if session is finished
    if (index >= queue.length) {
      setStatus('finished');
      const totalSeconds = queue.reduce((sum, item) => sum + item.intervalSeconds, 0);
      onSessionEnd(totalSeconds);
      return;
    }

    // Set initial remaining time immediately
    const intervalSeconds = queue[index].intervalSeconds;
    setRemaining(intervalSeconds);

    // Create new timer
    timerRef.current = createTimer(
      intervalSeconds,
      {
        onTick: (remaining: number) => {
          setRemaining(remaining);
        },
        onDone: () => {
          if (index + 1 >= queue.length) {
            setStatus('finished');
            const totalSeconds = queue.reduce((sum, item) => sum + item.intervalSeconds, 0);
            onSessionEnd(totalSeconds);
          } else {
            setIndex(index + 1);
          }
        },
      },
      250
    );

    return () => {
      if (timerRef.current) {
        timerRef.current.stop();
        timerRef.current = null;
      }
    };
  }, [index, queue, onSessionEnd]);

  const handlePauseResume = () => {
    if (!timerRef.current) return;
    if (status === 'paused') {
      timerRef.current.resume();
      setStatus('running');
    } else {
      timerRef.current.pause();
      setStatus('paused');
    }
  };

  const handleNext = () => {
    if (index + 1 < queue.length) {
      setIndex(index + 1);
    }
  };

  const handlePrevious = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setStatus('running');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePauseResume();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRestart();
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setHideUi(!hideUi);
      } else if (e.key === '?') {
        e.preventDefault();
        setShowHelp(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hideUi]);

  if (status === 'finished') {
    return null;
  }

  const currentImage = queue[index];
  const progressPercent = ((index + 1) / queue.length) * 100;

  return (
    <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Image */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={currentImage.url}
          alt={`Drawing reference ${index + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* UI Overlay */}
      {!hideUi && (
        <>
          {/* Top-Right: Large Timer */}
          <div className="absolute top-6 right-6 pointer-events-none">
            <div className="bg-black bg-opacity-75 rounded-lg px-8 py-6 backdrop-blur-sm border border-blue-500 border-opacity-30">
              <div className="text-6xl font-bold text-blue-400 text-center tabular-nums font-mono">
                {String(remaining).padStart(3, '0')}
              </div>
              <p className="text-sm text-gray-400 text-center mt-2">seconds</p>
            </div>
          </div>

          {/* Top: Progress Bar */}
          <div className="absolute top-6 left-6 right-32 pointer-events-none">
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-300 whitespace-nowrap">
                {index + 1} / {queue.length}
              </p>
              <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Bottom: Controls */}
          <div className="absolute bottom-6 left-0 right-0 pointer-events-auto flex justify-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={index === 0}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              ← Previous
            </button>
            <button
              onClick={handlePauseResume}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-medium min-w-32"
            >
              {status === 'paused' ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button
              onClick={handleNext}
              disabled={index === queue.length - 1}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Next →
            </button>
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium"
            >
              ↻ Restart
            </button>
          </div>

          {/* UI Toggle Button */}
          <button
            onClick={() => setHideUi(!hideUi)}
            className="absolute top-6 left-6 pointer-events-auto text-white text-2xl hover:opacity-70 z-50"
            title="Press H to toggle UI"
          >
            👁
          </button>

          {/* Help Button */}
          <button
            onClick={() => setShowHelp(true)}
            className="absolute bottom-6 right-6 pointer-events-auto text-white text-xl hover:opacity-70"
            title="Press ? for help"
          >
            ?
          </button>
        </>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center pointer-events-auto">
          <div className="bg-gray-900 text-white p-8 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold mb-4">Keyboard Shortcuts</h2>
            <div className="space-y-2 text-sm">
              <p>
                <kbd className="bg-gray-700 px-2 py-1 rounded">SPACE</kbd> - Pause/Resume
              </p>
              <p>
                <kbd className="bg-gray-700 px-2 py-1 rounded">→</kbd> - Next
              </p>
              <p>
                <kbd className="bg-gray-700 px-2 py-1 rounded">←</kbd> - Previous
              </p>
              <p>
                <kbd className="bg-gray-700 px-2 py-1 rounded">R</kbd> - Restart
              </p>
              <p>
                <kbd className="bg-gray-700 px-2 py-1 rounded">H</kbd> - Toggle UI
              </p>
              <p>
                <kbd className="bg-gray-700 px-2 py-1 rounded">?</kbd> - Help
              </p>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
