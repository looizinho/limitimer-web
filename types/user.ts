export interface UserRecord {
  id: string;
  username: string;
  pinHash: string;
  createdAt: number;
  lastLoginAt: number;
}

export interface User {
  userId: string;
  username: string;
}

export interface AuthContextType {
  userId: string | null;
  username: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (username: string, pin: string) => Promise<void>;
  logout: () => void;
}
