import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../../services/auth/auth.service';
import { lastValueFrom } from 'rxjs';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  const routeMock: ActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
  const stateMock: RouterStateSnapshot = { url: '/dashboard' } as RouterStateSnapshot;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is authenticated', async () => {
    authService.isAuthenticated.and.returnValue(true);

    const result = await lastValueFrom(guard.canActivate(routeMock, stateMock));

    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', async () => {
    authService.isAuthenticated.and.returnValue(false);

    const result = await lastValueFrom(guard.canActivate(routeMock, stateMock));

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
