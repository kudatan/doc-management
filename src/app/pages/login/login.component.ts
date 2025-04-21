import { Component, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import {ToastService} from '../../services/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, NgIf],
})
export class LoginComponent implements OnInit {
  loading = signal(false);
  form!: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toast: ToastService
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
    this.http
      .post<{
        token: string;
      }>('https://legaltech-testing.coobrick.app/api/v1/auth/login', this.form.value)
      .subscribe({
        next: res => {
          localStorage.setItem('token', res.token);
          this.toast.show('Logged in!', 'success');
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.toast.show('Login failed. Please check your credentials.', 'error');
          this.loading.set(false);
        },
      });
  }
}
