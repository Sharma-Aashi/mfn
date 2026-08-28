import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MessageResponse } from '../models/common.model';
import {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  User,
} from '../models/user.model';
import { SKIP_ERROR_TOAST } from '../interceptors/http-context.tokens';
import { TokenService } from './token.service';

// These auth flows are always driven from dedicated forms that render their own inline
// error state, so the generic global error toast would just be a redundant second message.
const SILENT = new HttpContext().set(SKIP_ERROR_TOAST, true);

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly base = `${environment.apiBaseUrl}/auth`;

  readonly currentUser = this.tokenService.user.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, request, { context: SILENT }).pipe(
      tap((res) => this.tokenService.set(res.token, res.user)),
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, request, { context: SILENT }).pipe(
      tap((res) => this.tokenService.set(res.token, res.user)),
    );
  }

  adminLogin(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/admin/login`, request, { context: SILENT }).pipe(
      tap((res) => this.tokenService.set(res.token, res.user)),
    );
  }

  logout(): void {
    this.tokenService.clear();
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/forgot-password`, request, { context: SILENT });
  }

  resetPassword(request: ResetPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/reset-password`, request, { context: SILENT });
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.base}/me`).pipe(
      tap((user) => {
        const token = this.tokenService.getToken();
        if (token) {
          this.tokenService.set(token, user);
        }
      }),
    );
  }

  updateProfile(request: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.base}/me`, request).pipe(
      tap((user) => {
        const token = this.tokenService.getToken();
        if (token) {
          this.tokenService.set(token, user);
        }
      }),
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/change-password`, request);
  }
}
