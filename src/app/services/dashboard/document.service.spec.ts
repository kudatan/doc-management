import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DocumentService } from './document.service';
import { environment } from '../../../environments/environment';
import { DocumentDto, DocumentStatus, ReviewStatus } from '../../interfaces/dashboard.interface';
import { User, RoleType } from '../../interfaces/user.interface';

describe('DocumentService', () => {
  let service: DocumentService;
  let httpMock: HttpTestingController;

  const mockDocument: DocumentDto = {
    id: '1',
    name: 'Test Document',
    status: 'DRAFT' as DocumentStatus,
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

  const mockDocuments = {
    results: [mockDocument],
    count: 1,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DocumentService],
    });

    service = TestBed.inject(DocumentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDocuments', () => {
    it('should get documents with basic parameters', () => {
      const params = { page: 1, size: 10 };
      service.getDocuments(params).subscribe((response) => {
        expect(response).toEqual(mockDocuments);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/document?page=1&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDocuments);
    });

    it('should get documents with all parameters', () => {
      const params = {
        page: 1,
        size: 10,
        sort: 'updatedAt,desc',
        status: 'DRAFT' as DocumentStatus,
        creatorId: '1',
        creatorEmail: 'test@example.com',
      };

      service.getDocuments(params).subscribe((response) => {
        expect(response).toEqual(mockDocuments);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/document?page=1&size=10&sort=updatedAt,desc&status=DRAFT&creatorId=1&creatorEmail=test@example.com`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockDocuments);
    });
  });

  describe('uploadDocument', () => {
    it('should upload document', () => {
      const formData = new FormData();
      formData.append('file', new File([], 'test.pdf'));
      formData.append('name', 'Test Document');

      service.uploadDocument(formData).subscribe((response) => {
        expect(response).toEqual(mockDocument);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/document`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(formData);
      req.flush(mockDocument);
    });
  });

  describe('sendToReview', () => {
    it('should send document to review', () => {
      const id = '1';
      service.sendToReview(id).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/document/${id}/send-to-review`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });
  });

  describe('getById', () => {
    it('should get document by id', () => {
      const id = '1';
      service.getById(id).subscribe((response) => {
        expect(response).toEqual(mockDocument);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/document/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDocument);
    });
  });

  describe('updateName', () => {
    it('should update document name', () => {
      const id = '1';
      const payload = { name: 'Updated Name' };
      service.updateName(id, payload).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/document/${id}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);
      req.flush(null);
    });
  });

  describe('deleteDocument', () => {
    it('should delete document', () => {
      const id = '1';
      service.deleteDocument(id).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/document/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('revokeReview', () => {
    it('should revoke document from review', () => {
      const id = '1';
      service.revokeReview(id).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/document/${id}/revoke-review`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });
  });

  describe('changeStatus', () => {
    it('should change document status', () => {
      const id = '1';
      const status: ReviewStatus = 'APPROVED';
      service.changeStatus(id, status).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/document/${id}/change-status`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ status });
      req.flush(null);
    });
  });
});
