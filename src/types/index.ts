export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  summary?: string | null;
}

