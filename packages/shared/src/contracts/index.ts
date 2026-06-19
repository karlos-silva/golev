export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    /** true quando a conta ainda usa senha temporária e precisa definir uma nova. */
    mustResetPassword: boolean;
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

export * from './anamnese';
export * from './billing';
export * from './patient';
