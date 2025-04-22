export interface Creator {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'REVIEWER';
}

export interface DocumentDto {
  id: string;
  name: string;
  status: DocumentStatus;
  fileUrl: string;
  updatedAt: string;
  createdAt: string;
  creator: Creator;
}

export type DocumentStatus =
  | 'DRAFT'
  | 'REVOKE'
  | 'READY_FOR_REVIEW'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'DECLINED';

export interface DocumentListResponse {
  results: DocumentDto[];
  count: number;
}
