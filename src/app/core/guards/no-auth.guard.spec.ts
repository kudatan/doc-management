import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoAuthGuard } from './no-auth.guard';
import { AuthService } from '../../services/auth/auth.service';

describe('NoAuthGuard', () => {
  let guard: NoAuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        NoAuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(NoAuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);

    const result = guard.canActivate();

    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard when user is already authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);

    const result = guard.canActivate();

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
