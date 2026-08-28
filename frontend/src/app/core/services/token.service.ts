import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

const TOKEN_KEY = 'vitalora_token';
const USER_KEY = 'vitalora_user';

@Injectable({ providedIn: 'root' })
export class TokenService {
  readonly token = signal<string | null>(this.readToken());
  readonly user = signal<User | null>(this.readUser());

  private readToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private readUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  set(token: string, user: User): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* localStorage unavailable (private browsing, etc.) - session still works in-memory */
    }
    this.token.set(token);
    this.user.set(user);
  }

  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
    this.token.set(null);
    this.user.set(null);
  }

  getToken(): string | null {
    return this.token();
  }
}
