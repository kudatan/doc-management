import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginPayload, LoginResponse, RegisterPayload } from '../../interfaces/auth.interface';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenSignal = signal<string | null>(localStorage.getItem('auth-token'));

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload);
  }

  register(payload: RegisterPayload): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/user/register`, payload);
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

  logout() {
    this.setToken(null);
    localStorage.removeItem('auth-token');
    localStorage.clear();
  }

  token = this.tokenSignal.asReadonly();
}
