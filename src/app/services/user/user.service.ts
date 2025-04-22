import { inject, Injectable, computed, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import {map, Observable} from 'rxjs';
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'REVIEWER';
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private userSignal = signal<User | null>(null);
  readonly user$ = this.userSignal.asReadonly();

  constructor() {
    effect(() => {
      const token = this.authService.token();
      if (token) {
        this.http.get<User>('https://legaltech-testing.coobrick.app/api/v1/user')
          .subscribe({
            next: (user) => this.userSignal.set(user),
            error: () => this.userSignal.set(null),
          });
      } else {
        this.userSignal.set(null);
      }
    });
  }

  getAllUsers(page = 1, size = 10): Observable<User[]> {
    return this.http
      .get<{ results: User[] }>('https://legaltech-testing.coobrick.app/api/v1/user/users', {
        params: {
          page,
          size
        }
      })
      .pipe(map(res => res.results));
  }


  readonly role = computed(() => this.userSignal()?.role ?? null);
  readonly isUser = computed(() => this.role() === 'USER');
  readonly isReviewer = computed(() => this.role() === 'REVIEWER');
}
