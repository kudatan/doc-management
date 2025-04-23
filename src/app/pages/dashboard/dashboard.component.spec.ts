import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { DocumentService } from '../../services/dashboard/document.service';
import { UserService } from '../../services/user/user.service';
import { DocumentDto, DocumentStatus } from '../../interfaces/dashboard.interface';
import { User, RoleType } from '../../interfaces/user.interface';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let documentService: jasmine.SpyObj<DocumentService>;
  let userService: jasmine.SpyObj<UserService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<any>>;

  const mockDocuments: DocumentDto[] = [
    {
      id: '1',
      name: 'Test Document 1',
      status: 'DRAFT' as DocumentStatus,
      fileUrl: 'http://example.com/doc1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: {
        id: '1',
        email: 'test1@example.com',
        fullName: 'Test User 1',
        role: 'USER' as RoleType,
      },
    },
    {
      id: '2',
      name: 'Test Document 2',
      status: 'APPROVED' as DocumentStatus,
      fileUrl: 'http://example.com/doc2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: {
        id: '2',
        email: 'test2@example.com',
        fullName: 'Test User 2',
        role: 'REVIEWER' as RoleType,
      },
    },
  ];

  const mockUsers: User[] = [
    {
      id: '1',
      email: 'test1@example.com',
      fullName: 'Test User 1',
      role: 'USER' as RoleType,
    },
    {
      id: '2',
      email: 'test2@example.com',
      fullName: 'Test User 2',
      role: 'REVIEWER' as RoleType,
    },
  ];

  beforeEach(async () => {
    const documentServiceSpy = jasmine.createSpyObj('DocumentService', ['getDocuments']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getAllUsers', 'isUser', 'isReviewer']);
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    documentServiceSpy.getDocuments.and.returnValue(of({ results: mockDocuments, count: mockDocuments.length }));
    userServiceSpy.getAllUsers.and.returnValue(of(mockUsers));
    userServiceSpy.isUser.and.returnValue(false);
    userServiceSpy.isReviewer.and.returnValue(true);
    dialogRef.afterClosed.and.returnValue(of(undefined));
    dialogSpy.open.and.returnValue(dialogRef);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, DashboardComponent],
      providers: [
        { provide: DocumentService, useValue: documentServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    documentService = TestBed.inject(DocumentService) as jasmine.SpyObj<DocumentService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('document loading', () => {
    it('should load all documents for non-user role', () => {
      userService.isUser.and.returnValue(false);
      fixture.detectChanges();
      expect(documentService.getDocuments).toHaveBeenCalled();
      // For non-user role, DRAFT documents are filtered out
      const expectedDocuments = mockDocuments.filter(doc => doc.status !== 'DRAFT');
      expect(component.documents()).toEqual(expectedDocuments);
      expect(component.total()).toBe(expectedDocuments.length);
    });

    it('should load all documents including DRAFT for user role', () => {
      userService.isUser.and.returnValue(true);
      userService.isReviewer.and.returnValue(false);
      fixture.detectChanges();
      expect(documentService.getDocuments).toHaveBeenCalled();
      expect(component.documents()).toEqual(mockDocuments);
      expect(component.total()).toBe(mockDocuments.length);
    });
  });

  it('should load users on init if not a regular user', () => {
    fixture.detectChanges();
    expect(userService.getAllUsers).toHaveBeenCalled();
    expect(component.users()).toEqual(mockUsers);
  });

  it('should not load users on init if user is a regular user', () => {
    userService.isUser.and.returnValue(true);
    userService.isReviewer.and.returnValue(false);
    fixture.detectChanges();
    expect(userService.getAllUsers).not.toHaveBeenCalled();
  });

  it('should update status filter and reload documents', () => {
    fixture.detectChanges();
    const newStatus: DocumentStatus = 'APPROVED';
    component.onStatusChange(newStatus);
    expect(component.statusFilter()).toBe(newStatus);
    expect(documentService.getDocuments).toHaveBeenCalled();
  });

  it('should update page and size on page change', () => {
    fixture.detectChanges();
    const pageEvent = { pageIndex: 1, pageSize: 20, length: 0 };
    component.onPageChange(pageEvent);
    expect(component.page()).toBe(2);
    expect(component.size()).toBe(20);
  });

  it('should open file upload dialog on add file', () => {
    fixture.detectChanges();
    component.onAddFile();
    expect(dialog.open).toHaveBeenCalled();
    expect(dialogRef.afterClosed).toHaveBeenCalled();
  });

  it('should update creator filter and reload documents', () => {
    fixture.detectChanges();
    const creatorId = '1';
    component.onCreatorChange(creatorId);
    expect(component.creatorFilter()).toBe(creatorId);
    expect(component.creatorEmailFilter()).toBeUndefined();
    expect(documentService.getDocuments).toHaveBeenCalled();
  });

  it('should update creator email filter and reload documents', () => {
    fixture.detectChanges();
    const email = 'test@example.com';
    component.onCreatorEmailChange(email);
    expect(component.creatorEmailFilter()).toBe(email);
    expect(component.creatorFilter()).toBeUndefined();
    expect(documentService.getDocuments).toHaveBeenCalled();
  });

  it('should reset all filters', () => {
    fixture.detectChanges();
    component.statusFilter.set('APPROVED' as DocumentStatus);
    component.creatorFilter.set('1');
    component.creatorEmailFilter.set('test@example.com');

    component.resetFilters();

    expect(component.statusFilter()).toBeUndefined();
    expect(component.creatorFilter()).toBeUndefined();
    expect(component.creatorEmailFilter()).toBeUndefined();
    expect(component.page()).toBe(1);
  });
});
