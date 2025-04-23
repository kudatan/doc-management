import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send login request to the API', () => {
      const mockPayload = { email: 'test@example.com', password: 'password123' };
      const mockResponse = { access_token: 'mock-token-123' };

      service.login(mockPayload).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPayload);
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should send register request to the API', () => {
      const mockPayload = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      };

      service.register(mockPayload).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/user/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPayload);
      req.flush({});
    });
  });

  describe('token management', () => {
    it('should set token in localStorage and signal', () => {
      const token = 'test-token-xyz';

      service.setToken(token);

      expect(localStorage.getItem('auth-token')).toBe(token);
      expect(service.getToken()).toBe(token);
    });

    it('should remove token when null is passed', () => {
      localStorage.setItem('auth-token', 'some-token');

      service.setToken(null);

      expect(localStorage.getItem('auth-token')).toBeNull();
      expect(service.getToken()).toBeNull();
    });

    it('should check authentication status correctly', () => {
      service.setToken(null);
      expect(service.isAuthenticated()).toBeFalse();

      service.setToken('some-token');
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should clear storage on logout', () => {
      localStorage.setItem('auth-token', 'test-token');
      localStorage.setItem('other-key', 'other-value');

      service.logout();

      expect(localStorage.getItem('auth-token')).toBeNull();
      expect(localStorage.getItem('other-key')).toBeNull();
    });
  });
});
