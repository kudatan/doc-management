import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DocumentViewComponent } from './document-view.component';
import { DocumentService } from '../../services/dashboard/document.service';
import { ToastService } from '../../services/toast/toast.service';
import { UserService } from '../../services/user/user.service';
import { DocumentDto, ReviewStatus } from '../../interfaces/dashboard.interface';
import { User, RoleType } from '../../interfaces/user.interface';

describe('DocumentViewComponent', () => {
  let component: DocumentViewComponent;
  let fixture: ComponentFixture<DocumentViewComponent>;
  let documentService: jasmine.SpyObj<DocumentService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let userService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;

  const mockDocument: DocumentDto = {
    id: '1',
    name: 'Test Document',
    status: 'DRAFT',
    fileUrl: 'http://example.com/doc',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creator: {
      id: '1',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'USER' as RoleType,
    },
  };

  beforeEach(async () => {
    const documentServiceSpy = jasmine.createSpyObj('DocumentService', [
      'getById',
      'updateName',
      'deleteDocument',
      'revokeReview',
      'sendToReview',
      'changeStatus',
    ]);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['isUser', 'isReviewer']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    documentServiceSpy.getById.and.returnValue(of(mockDocument));
    documentServiceSpy.updateName.and.returnValue(of(undefined));
    documentServiceSpy.deleteDocument.and.returnValue(of(undefined));
    documentServiceSpy.revokeReview.and.returnValue(of(undefined));
    documentServiceSpy.sendToReview.and.returnValue(of(undefined));
    documentServiceSpy.changeStatus.and.returnValue(of(undefined));

    userServiceSpy.isUser.and.returnValue(true);
    userServiceSpy.isReviewer.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [DocumentViewComponent],
      providers: [
        { provide: DocumentService, useValue: documentServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1',
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentViewComponent);
    component = fixture.componentInstance;
    documentService = TestBed.inject(DocumentService) as jasmine.SpyObj<DocumentService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load document on init', () => {
    fixture.detectChanges();
    expect(documentService.getById).toHaveBeenCalledWith('1');
    expect(component.document()).toEqual(mockDocument);
    expect(component.name()).toBe(mockDocument.name);
    expect(component.initialName()).toBe(mockDocument.name);
  });

  it('should handle document loading error', () => {
    documentService.getById.and.returnValue(throwError(() => new Error('Failed to load')));
    fixture.detectChanges();
    expect(toastService.show).toHaveBeenCalledWith('Failed to load document', 'error');
  });

  it('should update document name', () => {
    fixture.detectChanges();
    const newName = 'Updated Document Name';
    component.onNameChange(newName);
    component.saveName();

    expect(documentService.updateName).toHaveBeenCalledWith('1', { name: newName });
    expect(toastService.show).toHaveBeenCalledWith('Name updated successfully', 'success');
    expect(component.document()?.name).toBe(newName);
    expect(component.initialName()).toBe(newName);
  });

  it('should handle name update error', () => {
    fixture.detectChanges();
    documentService.updateName.and.returnValue(throwError(() => new Error('Failed to update')));
    
    const newName = 'Updated Document Name';
    component.onNameChange(newName);
    component.saveName();

    expect(toastService.show).toHaveBeenCalledWith('Failed to update name', 'error');
  });

  it('should delete document', () => {
    fixture.detectChanges();
    component.deleteDocument();

    expect(documentService.deleteDocument).toHaveBeenCalledWith('1');
    expect(toastService.show).toHaveBeenCalledWith('Document deleted', 'success');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle delete error', () => {
    fixture.detectChanges();
    documentService.deleteDocument.and.returnValue(throwError(() => new Error('Failed to delete')));
    
    component.deleteDocument();

    expect(toastService.show).toHaveBeenCalledWith('Failed to delete document', 'error');
  });

  it('should revoke document from review', () => {
    fixture.detectChanges();
    component.revokeDocument();

    expect(documentService.revokeReview).toHaveBeenCalledWith('1');
    expect(toastService.show).toHaveBeenCalledWith('Document revoked from review', 'success');
  });

  it('should send document to review', () => {
    fixture.detectChanges();
    component.sendToReview();

    expect(documentService.sendToReview).toHaveBeenCalledWith('1');
    expect(toastService.show).toHaveBeenCalledWith('Document sent to review', 'success');
  });

  it('should change document status', () => {
    fixture.detectChanges();
    userService.isReviewer.and.returnValue(true);
    const newStatus: ReviewStatus = 'APPROVED';
    
    component.changeStatus(newStatus);

    expect(documentService.changeStatus).toHaveBeenCalledWith('1', newStatus);
    expect(toastService.show).toHaveBeenCalledWith(`Status changed to ${newStatus}`, 'success');
  });

  it('should not allow status change for non-reviewer', () => {
    fixture.detectChanges();
    userService.isReviewer.and.returnValue(false);
    const newStatus: ReviewStatus = 'APPROVED';
    
    component.changeStatus(newStatus);

    expect(documentService.changeStatus).not.toHaveBeenCalled();
  });

  it('should handle status change error', () => {
    fixture.detectChanges();
    userService.isReviewer.and.returnValue(true);
    const errorMessage = 'Invalid status change';
    documentService.changeStatus.and.returnValue(throwError(() => ({ error: { message: errorMessage } })));
    
    component.changeStatus('APPROVED');

    expect(toastService.show).toHaveBeenCalledWith(errorMessage, 'error');
  });

  it('should refresh document', () => {
    fixture.detectChanges();
    const updatedDoc = { ...mockDocument, name: 'Updated Document' };
    documentService.getById.and.returnValue(of(updatedDoc));
    
    component.refreshDocument();

    expect(documentService.getById).toHaveBeenCalledWith('1');
    expect(component.document()).toEqual(updatedDoc);
  });

  it('should handle refresh error', () => {
    fixture.detectChanges();
    documentService.getById.and.returnValue(throwError(() => new Error('Failed to refresh')));
    
    component.refreshDocument();

    expect(toastService.show).toHaveBeenCalledWith('Failed to refresh document', 'error');
  });

  it('should navigate back to dashboard', () => {
    fixture.detectChanges();
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  describe('permissions', () => {
    it('should allow delete for user with DRAFT status', () => {
      fixture.detectChanges();
      userService.isUser.and.returnValue(true);
      component.document.set({ ...mockDocument, status: 'DRAFT' });
      expect(component.canDelete).toBeTrue();
    });

    it('should allow revoke for user with READY_FOR_REVIEW status', () => {
      fixture.detectChanges();
      userService.isUser.and.returnValue(true);
      component.document.set({ ...mockDocument, status: 'READY_FOR_REVIEW' });
      expect(component.canRevoke).toBeTrue();
    });

    it('should allow send to review for user with DRAFT status', () => {
      fixture.detectChanges();
      userService.isUser.and.returnValue(true);
      component.document.set({ ...mockDocument, status: 'DRAFT' });
      expect(component.canSendToReview).toBeTrue();
    });
  });
});
