import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'REVIEWER';
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = 'https://legaltech-testing.coobrick.app/api/v1';
  private http = inject(HttpClient);

  private _user = signal<User | null>(null);
  readonly user = this._user; // 👈 використовуємо в компоненті

  loadUser(): void {
    this.http.get<User>(`${this.baseUrl}/user`).subscribe({
      next: (user) => this._user.set(user),
      error: () => this._user.set(null),
    });
  }

  clearUser(): void {
    this._user.set(null);
  }

  readonly role = computed(() => this._user()?.role ?? null);
  readonly isUser = computed(() => this.role() === 'USER');
  readonly isReviewer = computed(() => this.role() === 'REVIEWER');
}
