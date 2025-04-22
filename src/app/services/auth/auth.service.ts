import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from '../../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://legaltech-testing.coobrick.app/api/v1';
  private readonly tokenSignal = signal<string | null>(
    localStorage.getItem('auth-token')
  );

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, payload);
  }

  register(payload: RegisterPayload): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/user/register`, payload);
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('auth-token');
    localStorage.clear();
  }

  setToken(token: string | null): void {
    if (token) {
      localStorage.setItem('auth-token', token);
    } else {
      localStorage.removeItem('auth-token');
    }
    this.tokenSignal.set(token);
  }

  isAuthenticated(): boolean {
    return !!this.tokenSignal();
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  token = this.tokenSignal.asReadonly(); // Якщо треба підписуватись в компоненті
}
