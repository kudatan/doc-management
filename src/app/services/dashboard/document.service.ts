import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DocumentDto,
  DocumentListResponse,
  DocumentStatus, ReviewStatus,
} from '../../interfaces/dashboard.interface';
import {environment} from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);

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

    return this.http.get<DocumentListResponse>(`${environment.apiUrl}/document`, {
      params: queryParams,
    });
  }

  uploadDocument(formData: FormData): Observable<DocumentDto> {
    return this.http.post<DocumentDto>(`${environment.apiUrl}/document`, formData);
  }

  sendToReview(id: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/document/${id}/send-to-review`, {});
  }

  getById(id: string): Observable<DocumentDto> {
    return this.http.get<DocumentDto>(`${environment.apiUrl}/document/${id}`);
  }

  updateName(id: string, payload: { name: string }): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/document/${id}`, payload);
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/document/${id}`);
  }

  revokeReview(id: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/document/${id}/revoke-review`, {});
  }

  changeStatus(id: string, status: ReviewStatus): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/document/${id}/change-status`, { status });
  }

}
