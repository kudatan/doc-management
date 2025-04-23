import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DocumentDto,
  DocumentListResponse,
  DocumentStatus,
} from '../../interfaces/dashboard.interface';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);
  private baseUrl = 'https://legaltech-testing.coobrick.app/api/v1/document';

  getDocuments(params: {
    page: number;
    size: number;
    sort?: string;
    status?: DocumentStatus;
    creatorId?: string;
    creatorEmail?: string;
  }): Observable<DocumentListResponse> {
    let queryParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);

    if (params.sort) queryParams = queryParams.set('sort', params.sort);
    if (params.status) queryParams = queryParams.set('status', params.status);
    if (params.creatorId)
      queryParams = queryParams.set('creatorId', params.creatorId);
    if (params.creatorEmail)
      queryParams = queryParams.set('creatorEmail', params.creatorEmail);

    return this.http.get<DocumentListResponse>(this.baseUrl, {
      params: queryParams,
    });
  }

  uploadDocument(formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl, formData);
  }

  sendToReview(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/send-to-review`, {});
  }

  getById(id: string): Observable<DocumentDto> {
    return this.http.get<DocumentDto>(`${this.baseUrl}/${id}`);
  }

  updateName(id: string, payload: { name: string }): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}`, payload);
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  revokeReview(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/revoke-review`, {});
  }

  changeStatus(id: string, status: 'UNDER_REVIEW' | 'APPROVED' | 'DECLINED'): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/change-status`, { status });
  }

}
