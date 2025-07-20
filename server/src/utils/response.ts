export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface StandardSuccess<T> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    pagination?: PaginationMeta;
  };
}

export const send = <T>(res: import('express').Response, data: T, pagination?: PaginationMeta) => {
  const payload: StandardSuccess<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...(pagination ? { pagination } : {})
    }
  };
  res.json(payload);
}; 