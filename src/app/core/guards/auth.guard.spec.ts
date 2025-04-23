import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return Observable<true> if authenticated', (done) => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    guard.canActivate(mockRoute, mockState).subscribe((result) => {
      expect(result).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should navigate to /login and return Observable<false> if not authenticated', (done) => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    guard.canActivate(mockRoute, mockState).subscribe((result) => {
      expect(result).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});
