import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploadDialogComponent } from './file-upload-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { DocumentService } from '../../services/dashboard/document.service';
import { ToastService } from '../../services/toast/toast.service';
import { of, throwError } from 'rxjs';
import { DocumentDto } from '../../interfaces/dashboard.interface';
import { Validators } from '@angular/forms';

describe('FileUploadDialogComponent', () => {
  let component: FileUploadDialogComponent;
  let fixture: ComponentFixture<FileUploadDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<FileUploadDialogComponent>>;
  let documentService: jasmine.SpyObj<DocumentService>;
  let toastService: jasmine.SpyObj<ToastService>;

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
      role: 'USER',
    },
  };

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const documentServiceSpy = jasmine.createSpyObj('DocumentService', ['uploadDocument', 'sendToReview']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);

    await TestBed.configureTestingModule({
      imports: [FileUploadDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: DocumentService, useValue: documentServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<FileUploadDialogComponent>>;
    documentService = TestBed.inject(DocumentService) as jasmine.SpyObj<DocumentService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form initialization', () => {
    it('should initialize form with default values', () => {
      expect(component.form.get('name')).toBeTruthy();
      expect(component.form.get('status')).toBeTruthy();
      expect(component.form.get('name')?.value).toBe('');
      expect(component.form.get('status')?.value).toBe('DRAFT');
    });

    it('should have required validator on name field', () => {
      const nameControl = component.form.get('name');
      expect(nameControl?.hasValidator(Validators.required)).toBeTrue();
    });
  });

  describe('file selection', () => {
    it('should handle file selection', () => {
      const file = new File([''], 'test.pdf');
      const event = {
        target: {
          files: [file],
        },
      } as unknown as Event;

      component.onFileSelected(event);
      expect(component.selectedFile).toBe(file);
    });

    it('should handle empty file selection', () => {
      const event = {
        target: {
          files: [],
        },
      } as unknown as Event;

      component.onFileSelected(event);
      expect(component.selectedFile).toBeNull();
    });
  });

  describe('form submission', () => {
    it('should not submit if form is invalid', () => {
      component.form.get('name')?.setValue('');
      component.selectedFile = null;

      component.onSubmit();
      expect(documentService.uploadDocument).not.toHaveBeenCalled();
    });

    it('should not submit if no file is selected', () => {
      component.form.get('name')?.setValue('Test Document');
      component.selectedFile = null;

      component.onSubmit();
      expect(documentService.uploadDocument).not.toHaveBeenCalled();
    });

    it('should upload document and close dialog on success', () => {
      const formData = new FormData();
      formData.append('file', new File([''], 'test.pdf'));
      formData.append('name', 'Test Document');
      formData.append('status', 'DRAFT');

      component.form.get('name')?.setValue('Test Document');
      component.selectedFile = new File([''], 'test.pdf');
      documentService.uploadDocument.and.returnValue(of(mockDocument));

      component.onSubmit();
      expect(documentService.uploadDocument).toHaveBeenCalled();
      expect(toastService.show).toHaveBeenCalledWith('File uploaded successfully', 'success');
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should handle upload error', () => {
      component.form.get('name')?.setValue('Test Document');
      component.selectedFile = new File([''], 'test.pdf');
      documentService.uploadDocument.and.returnValue(throwError(() => new Error('Upload failed')));

      component.onSubmit();
      expect(toastService.show).toHaveBeenCalledWith('File upload failed', 'error');
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('should send document to review if status is READY_FOR_REVIEW', () => {
      component.form.get('name')?.setValue('Test Document');
      component.form.get('status')?.setValue('READY_FOR_REVIEW');
      component.selectedFile = new File([''], 'test.pdf');
      documentService.uploadDocument.and.returnValue(of(mockDocument));
      documentService.sendToReview.and.returnValue(of(void 0));

      component.onSubmit();
      expect(documentService.sendToReview).toHaveBeenCalledWith(mockDocument.id);
      expect(toastService.show).toHaveBeenCalledWith('Document sent to review successfully', 'success');
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should handle send to review error', () => {
      component.form.get('name')?.setValue('Test Document');
      component.form.get('status')?.setValue('READY_FOR_REVIEW');
      component.selectedFile = new File([''], 'test.pdf');
      documentService.uploadDocument.and.returnValue(of(mockDocument));
      documentService.sendToReview.and.returnValue(throwError(() => new Error('Review failed')));

      component.onSubmit();
      expect(toastService.show).toHaveBeenCalledWith('Failed to send document to review', 'error');
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('dialog actions', () => {
    it('should close dialog on cancel', () => {
      component.onCancel();
      expect(dialogRef.close).toHaveBeenCalled();
    });
  });
}); 