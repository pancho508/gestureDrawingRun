import { Category, ImageQueueItem, ReferenceImage } from './image';

export interface SessionPreset {
  id: string;
  name: string;
  intervalsSeconds: number[];
  defaultCategory?: Category;
}

export interface StartSessionRequest {
  presetId: string;
  category: Category;
  includeNsfw: boolean;
  tags: string[];
}

export interface StartSessionResponse {
  sessionRunId: string;
  preset: SessionPreset;
  queue: ImageQueueItem[];
}

export interface SessionStats {
  totalSecondsPracticed: number;
  sessionsCompleted: number;
  lastSessionSeconds?: number;
}
