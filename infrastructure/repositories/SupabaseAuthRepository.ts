import { User } from "@/domain/entities/User";
import {
  AuthRepository,
  Session,
} from "@/domain/repositories/AuthRepository";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly client: SupabaseClient) {}

  async signUp(
    email: string,
    password: string
  ): Promise<{ user: User; session: Session }> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(`Failed to sign up: ${error.message}`);
    }

    if (!data.user || !data.session) {
      throw new Error("Sign up did not return user or session");
    }

    return {
      user: new User(data.user.id, data.user.email ?? email),
      session: this.toSession(data.session),
    };
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ user: User; session: Session }> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(`Failed to sign in: ${error.message}`);
    }

    if (!data.user || !data.session) {
      throw new Error("Sign in did not return user or session");
    }

    return {
      user: new User(data.user.id, data.user.email ?? email),
      session: this.toSession(data.session),
    };
  }

  async signOut(_token: string): Promise<void> {
    // El cierre de sesión real ocurre en el cliente eliminando el token.
    // Aquí simplemente validamos que el repositorio responde correctamente.
    return Promise.resolve();
  }

  async getCurrentUser(token: string): Promise<User | null> {
    const { data, error } = await this.client.auth.getUser(token);

    if (error || !data.user) {
      return null;
    }

    return new User(data.user.id, data.user.email ?? "");
  }

  private toSession(session: {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
  }): Session {
    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at,
    };
  }
}
