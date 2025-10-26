export interface AuthToken {
  id: string;
  username: string;
  email: string;
}

export interface ConnectionContext {
  user?: AuthToken;
}
