export interface Space {
  id: string;
  name: string;
  created_at: string;
}

export interface Source {
  doc_id: string;
  relevance_score: number | string;
  chunk_text: string;
  filename: string;
}

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
}

export interface Document {
  name: string;
  uploadedAt?: Date;
  type: string;
  isUploading?: boolean;
  id?: string; // original_file_id from backend
}
