import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { ToastService } from '../../services/toast/toast.service';
import { AuthService } from '../../services/auth/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    MatSelectModule,
    MatOptionModule,
  ],
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  loading = signal(false);
  form!: ReturnType<FormBuilder['group']>;

  ngOnInit() {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER', Validators.required],
    });
  }

  register() {
    if (this.form.invalid) return;

    this.loading.set(true);

    this.auth
      .register(this.form.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.show('Registration successful!', 'success');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          const message = err?.error?.message;
          this.toast.show(
            Array.isArray(message)
              ? message.join(', ')
              : typeof message === 'string'
              ? message
              : 'Registration failed. Try a different email.',
            'error'
          );
          this.loading.set(false);
        },
      });
  }
}
