import { Component, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {ToastService} from '../../services/toast/toast.service';
import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class LoginComponent implements OnInit {
  loading = signal(false);
  form!: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.form.invalid) return;

    this.loading.set(true);

    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        this.auth.setToken(res.access_token);
        this.toast.show('Logged in!', 'success');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.toast.show('Login failed. Please check your credentials.', 'error');
        this.loading.set(false);
      }
    });
  }
}
