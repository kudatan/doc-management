import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): boolean {
    const isAuth = this.authService.isAuthenticated();
    if (isAuth) {
      this.router.navigate(['/dashboard']);
    }
    return !isAuth;
  }
}
