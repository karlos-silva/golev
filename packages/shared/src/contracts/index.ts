export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    tenantId: string;
    role: string;
  };
  tokens: AuthTokens;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  perPage?: number;
}
