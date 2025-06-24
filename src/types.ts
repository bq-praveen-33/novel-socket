export interface JoinData {
  noteId: string;
  email?: string;
}

export interface UpdateData {
  noteId: string;
  content: unknown;
}

export interface CursorData {
  noteId: string;
  user: string;
  from: number;
  to: number;
}

export interface CursorPosition {
  from: number;
  to: number;
  user: string;
}