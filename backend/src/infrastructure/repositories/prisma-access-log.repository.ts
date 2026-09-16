import { Injectable } from '@nestjs/common';
import type { AccessLog } from '../../domain/entities/access-log.entity';
import type { AccessLogRepository } from '../../domain/repositories/access-log.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaAccessLogRepository implements AccessLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { userId: string; appSlug: string }): Promise<AccessLog> {
    const row = await this.prisma.accessLog.create({ data });
    return {
      id: row.id,
      userId: row.userId,
      appSlug: row.appSlug,
      launchedAt: row.launchedAt,
    };
  }

  async list(filters: {
    userId?: string;
    page: number;
    perPage: number;
  }): Promise<{
    items: AccessLog[];
    total: number;
    page: number;
    perPage: number;
  }> {
    const where = filters.userId ? { userId: filters.userId } : {};
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.accessLog.findMany({
        where,
        orderBy: { launchedAt: 'desc' },
        skip: (filters.page - 1) * filters.perPage,
        take: filters.perPage,
        include: { user: { select: { name: true, email: true } } },
      }),
      this.prisma.accessLog.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        appSlug: row.appSlug,
        launchedAt: row.launchedAt,
        userName: row.user.name,
        userEmail: row.user.email,
      })),
      total,
      page: filters.page,
      perPage: filters.perPage,
    };
  }
}
