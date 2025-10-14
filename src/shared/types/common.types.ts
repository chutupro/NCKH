/**
 * Pagination query interface
 */
export interface PaginationQuery {
  readonly page?: number;
  readonly limit?: number;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  readonly data: T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

/**
 * Success response interface
 */
export interface SuccessResponse {
  readonly success: boolean;
  readonly message: string;
}

/**
 * File upload result interface
 */
export interface FileUploadResult {
  readonly filePath: string;
  readonly originalName: string;
  readonly size: number;
}

