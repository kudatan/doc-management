import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast/toast.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatOptionModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required controls', () => {
    expect(component.form.get('fullName')).toBeTruthy();
    expect(component.form.get('email')).toBeTruthy();
    expect(component.form.get('password')).toBeTruthy();
    expect(component.form.get('role')).toBeTruthy();
  });

  it('should set initial role value to USER', () => {
    expect(component.form.get('role')?.value).toBe('USER');
  });

  it('should mark form as invalid when empty', () => {
    component.form.get('fullName')?.setValue('');
    component.form.get('email')?.setValue('');
    component.form.get('password')?.setValue('');
    expect(component.form.valid).toBeFalsy();
  });

  describe('form validation', () => {
    it('should validate fullName as required', () => {
      const fullNameControl = component.form.get('fullName');

      fullNameControl?.setValue('');
      expect(fullNameControl?.valid).toBeFalsy();
      expect(fullNameControl?.hasError('required')).toBeTruthy();

      fullNameControl?.setValue('John Doe');
      expect(fullNameControl?.valid).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.form.get('email');

      emailControl?.setValue('');
      expect(emailControl?.valid).toBeFalsy();
      expect(emailControl?.hasError('required')).toBeTruthy();

      emailControl?.setValue('invalid-email');
      expect(emailControl?.valid).toBeFalsy();
      expect(emailControl?.hasError('email')).toBeTruthy();

      emailControl?.setValue('valid@example.com');
      expect(emailControl?.valid).toBeTruthy();
    });

    it('should validate password requirements', () => {
      const passwordControl = component.form.get('password');

      passwordControl?.setValue('');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.hasError('required')).toBeTruthy();

      passwordControl?.setValue('12345');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.hasError('minlength')).toBeTruthy();

      passwordControl?.setValue('123456');
      expect(passwordControl?.valid).toBeTruthy();
    });
  });

  describe('register method', () => {
    it('should not call auth service if form is invalid', () => {
      component.form.setValue({
        fullName: '',
        email: '',
        password: '',
        role: 'USER',
      });
      component.register();
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should call auth service with form values on valid form', () => {
      const testUser = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'USER',
      };
      authService.register.and.returnValue(of(undefined));

      component.form.setValue(testUser);
      component.register();

      expect(authService.register).toHaveBeenCalledWith(testUser);
    });

    it('should handle successful registration', () => {
      authService.register.and.returnValue(of(undefined));

      component.form.setValue({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'USER',
      });
      component.register();

      expect(toastService.show).toHaveBeenCalledWith('Registration successful!', 'success');
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle registration error with string message', () => {
      const errorResponse = {
        error: { message: 'Email already exists' },
      };
      authService.register.and.returnValue(throwError(() => errorResponse));

      component.form.setValue({
        fullName: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'USER',
      });
      component.register();

      expect(toastService.show).toHaveBeenCalledWith('Email already exists', 'error');
      expect(component.loading()).toBeFalse();
    });

    it('should handle registration error with array of messages', () => {
      const errorResponse = {
        error: { message: ['Email already exists', 'Invalid role'] },
      };
      authService.register.and.returnValue(throwError(() => errorResponse));

      component.form.setValue({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'INVALID',
      });
      component.register();

      expect(toastService.show).toHaveBeenCalledWith('Email already exists, Invalid role', 'error');
      expect(component.loading()).toBeFalse();
    });

    it('should handle registration error with no specific message', () => {
      authService.register.and.returnValue(throwError(() => new Error('Unknown error')));

      component.form.setValue({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'USER',
      });
      component.register();

      expect(toastService.show).toHaveBeenCalledWith(
        'Registration failed. Try a different email.',
        'error',
      );
      expect(component.loading()).toBeFalse();
    });
  });
});
