export interface User {
  id: string;
  username: string;
  email: string;
  token: string;
}

export interface EditorProps {
  documentId: string;
  user: User;
}

export interface CursorPosition {
  name: string;
  color: string;
}
