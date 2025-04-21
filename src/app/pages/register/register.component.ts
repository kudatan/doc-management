import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {NgIf} from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import {ToastService} from '../../services/toast/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgIf,
    MatSelectModule,
    MatOptionModule
  ]
})
export class RegisterComponent implements OnInit {
  loading = signal(false);
  form!: ReturnType<FormBuilder['group']>;

  constructor(private fb: FormBuilder,
              private http: HttpClient,
              private router: Router,
              private toast: ToastService) {}

  ngOnInit() {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER', Validators.required]
    });
  }

  register() {
    if (this.form.invalid) return;

    const payload = this.form.value;

    this.loading.set(true);

    this.http.post('https://legaltech-testing.coobrick.app/api/v1/user/register', payload).subscribe({
      next: () => {
        this.toast.show('Registration successful!', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const message = err?.error?.message;

        if (Array.isArray(message)) {
          this.toast.show(message.join(', '), 'error');
        } else if (typeof message === 'string') {
          this.toast.show(message, 'error');
        } else {
          this.toast.show('Registration failed. Try a different email.', 'error');
        }

        this.loading.set(false);
      }
    });
  }
}
