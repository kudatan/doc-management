import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {DocumentListResponse, DocumentStatus} from '../../interfaces/dashboard.interface';


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
    if (params.creatorId) queryParams = queryParams.set('creatorId', params.creatorId);
    if (params.creatorEmail) queryParams = queryParams.set('creatorEmail', params.creatorEmail);

    return this.http.get<DocumentListResponse>(this.baseUrl, { params: queryParams });
  }
}
