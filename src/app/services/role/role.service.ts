import { inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly userRole = signal<'User' | 'Reviewer'>('User');

  setRole(role: 'User' | 'Reviewer') {
    this.userRole.set(role);
  }

  get role() {
    return this.userRole();
  }

  isUser() {
    return this.userRole() === 'User';
  }

  isReviewer() {
    return this.userRole() === 'Reviewer';
  }
}
