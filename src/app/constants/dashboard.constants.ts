import { DocumentStatus } from '../interfaces/dashboard.interface';

export const DOCUMENT_STATUSES: DocumentStatus[] = [
  'DRAFT',
  'REVOKE',
  'READY_FOR_REVIEW',
  'UNDER_REVIEW',
  'APPROVED',
  'DECLINED',
];

export const DOCUMENT_TABLE_COLUMNS = [
  'name',
  'status',
  'createdAt',
  'creator',
  'updatedAt',
  'action',
];

export const DEFAULT_PAGE_SIZE = 5;
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20];
export const DEFAULT_USERS_PAGE_SIZE = 5;
