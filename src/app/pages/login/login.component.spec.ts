import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from '../../services/toast/toast.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'setToken']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with email and password controls', () => {
    expect(component.form.get('email')).toBeTruthy();
    expect(component.form.get('password')).toBeTruthy();
  });

  it('should mark form as invalid when empty', () => {
    expect(component.form.valid).toBeFalsy();
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

  it('should validate password as required', () => {
    const passwordControl = component.form.get('password');

    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.hasError('required')).toBeTruthy();

    passwordControl?.setValue('password123');
    expect(passwordControl?.valid).toBeTruthy();
  });

  describe('login method', () => {
    it('should not call auth service if form is invalid', () => {
      component.form.setValue({ email: '', password: '' });
      component.login();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should call auth service with form values on valid form', () => {
      const testCredentials = { email: 'test@example.com', password: 'password123' };
      authService.login.and.returnValue(of({ access_token: 'test-token' }));

      component.form.setValue(testCredentials);
      component.login();

      expect(authService.login).toHaveBeenCalledWith(testCredentials);
    });

    it('should handle successful login', () => {
      const testToken = 'test-token-123';
      authService.login.and.returnValue(of({ access_token: testToken }));

      component.form.setValue({ email: 'test@example.com', password: 'password123' });
      component.login();

      expect(authService.setToken).toHaveBeenCalledWith(testToken);
      expect(toastService.show).toHaveBeenCalledWith('Logged in!', 'success');
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should handle login error', () => {
      authService.login.and.returnValue(throwError(() => new Error('Login failed')));

      component.form.setValue({ email: 'test@example.com', password: 'wrong-password' });
      component.login();

      expect(toastService.show).toHaveBeenCalledWith(
        'Login failed. Please check your credentials.',
        'error',
      );
      expect(component.loading()).toBeFalse();
    });
  });
});
