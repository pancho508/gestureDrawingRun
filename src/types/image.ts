export type Category = 'figure' | 'hands' | 'faces' | 'animals';

export interface ReferenceImage {
  id: string;
  url: string;
  category: Category;
  tags: string[];
  isNsfw: boolean;
  width?: number;
  height?: number;
  source?: string;
}

export interface ImageQueueItem extends ReferenceImage {
  intervalSeconds: number;
}
