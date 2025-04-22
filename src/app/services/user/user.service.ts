import {inject, Injectable, signal} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = 'https://legaltech-testing.coobrick.app/api/v1';
  private http = inject(HttpClient);

  readonly user$ = toSignal(this.http.get<User>(`${this.baseUrl}/user`), {
    initialValue: null,
  });
}
