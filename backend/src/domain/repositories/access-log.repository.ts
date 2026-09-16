import type { AccessLog } from '../entities/access-log.entity';

export const ACCESS_LOG_REPOSITORY = Symbol('ACCESS_LOG_REPOSITORY');

export interface AccessLogRepository {
  create(data: { userId: string; appSlug: string }): Promise<AccessLog>;
  list(filters: { userId?: string; page: number; perPage: number }): Promise<{
    items: AccessLog[];
    total: number;
    page: number;
    perPage: number;
  }>;
}
