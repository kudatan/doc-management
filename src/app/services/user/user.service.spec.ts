import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { environment } from '../../../environments/environment';
import { User, RoleType } from '../../interfaces/user.interface';
import { AuthService } from '../auth/auth.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'USER' as RoleType,
  };

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['token']);
    authSpy.token.and.returnValue(null);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService, { provide: AuthService, useValue: authSpy }],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return list of users from API', () => {
    const mockUsers = [mockUser, { ...mockUser, id: '2', role: 'REVIEWER' as RoleType }];

    let result: User[] | undefined;

    service.getAllUsers().subscribe((users) => {
      result = users;
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/user/users?page=1&size=10`);
    expect(req.request.method).toBe('GET');
    req.flush({ results: mockUsers });

    expect(result).toEqual(mockUsers);
  });

  it('should correctly determine user role', () => {
    (service as any).userSignal.set(mockUser);

    expect(service.role()).toBe('USER');
    expect(service.isUser()).toBeTrue();
    expect(service.isReviewer()).toBeFalse();

    (service as any).userSignal.set({ ...mockUser, role: 'REVIEWER' as RoleType });

    expect(service.role()).toBe('REVIEWER');
    expect(service.isUser()).toBeFalse();
    expect(service.isReviewer()).toBeTrue();
  });
});
