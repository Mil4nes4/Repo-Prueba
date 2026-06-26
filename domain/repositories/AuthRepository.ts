import { User } from "@/domain/entities/User";

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export interface AuthRepository {
  signUp(email: string, password: string): Promise<{ user: User; session: Session }>;
  signIn(email: string, password: string): Promise<{ user: User; session: Session }>;
  signOut(token: string): Promise<void>;
  getCurrentUser(token: string): Promise<User | null>;
}
