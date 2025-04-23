import { User } from './user.interface';

export interface DocumentDto {
  id: string;
  name: string;
  status: DocumentStatus;
  fileUrl: string;
  updatedAt: string;
  createdAt: string;
  creator: User;
}

export type DocumentStatus =
  | 'DRAFT'
  | 'REVOKE'
  | 'READY_FOR_REVIEW'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'DECLINED';

export type ReviewStatus = 'UNDER_REVIEW' | 'APPROVED' | 'DECLINED';

export interface DocumentListResponse {
  results: DocumentDto[];
  count: number;
}
