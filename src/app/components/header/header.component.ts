// src/app/components/header/header.component.ts
import { Component, computed, effect, inject } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatAnchor } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../../shared/icons/logo/logo.component';
import { AsyncPipe, NgIf } from '@angular/common';
import {UserService} from '../../services/user/user.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbar,
    MatAnchor,
    RouterLink,
    LogoComponent,
    NgIf,
    AsyncPipe,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private userService = inject(UserService);
  user = this.userService.user$;
}
