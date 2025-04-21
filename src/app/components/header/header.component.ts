import { Component } from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {MatAnchor} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {LogoComponent} from '../../shared/icons/logo/logo.component';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbar,
    MatAnchor,
    RouterLink,
    LogoComponent
  ],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
