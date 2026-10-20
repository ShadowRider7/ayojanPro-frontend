export interface TMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: TMeta;
}

export interface ApiErrorDetail {
  name: string;
  message: string;
  stack?: string;
}

export interface ApiError {
  success: false;
  statusCode: number;

  name: string;
  message: string;
  error?: ApiErrorDetail;
}

export interface IQuery {
  searchTerm?: string;
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
  [key: string]: string | number | boolean | undefined;
}
