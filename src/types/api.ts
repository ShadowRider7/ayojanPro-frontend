/**
 * Envelope types shared by every endpoint. Mirrors the backend
 * `sendResponse` helper (`src/app/utils/sendResponse.ts`) and
 * `globalErrorHandler` (`src/app/middleware/globalErrorHandler.ts`).
 */

/** Pagination metadata returned alongside list endpoints. */
export interface TMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated payload shape. The backend nests this in the envelope's `data`
 * field, e.g. `ApiResponse<IPaginated<Event>>`.
 */
export interface IPaginated<T> {
  data: T[];
  meta: TMeta;
}

/** Successful response envelope. */
export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: TMeta;
}

/** Extra debugging detail the backend only sends in development. */
export interface ApiErrorDetail {
  name: string;
  message: string;
  stack?: string;
}

/** Error response envelope. */
export interface ApiError {
  success: false;
  statusCode: number;
  /** HTTP status text, e.g. `Not Found`. */
  name: string;
  message: string;
  error?: ApiErrorDetail;
}

/**
 * Query-parameter bag accepted by list endpoints. Mirrors the backend
 * `IQuery` interface but avoids `any` so it can flow through the API client.
 */
export interface IQuery {
  searchTerm?: string;
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
  [key: string]: string | number | boolean | undefined;
}
