import { Component, inject } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatAnchor, MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { LogoComponent } from '../../shared/icons/logo/logo.component';
import { NgIf } from '@angular/common';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbar, MatAnchor, RouterLink, LogoComponent, NgIf, MatIconModule, MatButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  user = this.userService.user$;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
