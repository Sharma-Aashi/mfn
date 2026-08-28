export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string>;
}

export interface MessageResponse {
  message: string;
}

export interface BulkStatusRequest {
  ids: number[];
  active: boolean;
}

export interface StatusUpdateRequest {
  active: boolean;
}
