import { Inject, Injectable } from '@nestjs/common';
import type { AccessLog } from '../../../domain/entities/access-log.entity';
import {
  findSuiteApp,
  isAppEntitled,
  type SuiteApp,
} from '../../../domain/catalog/suite-catalog';
import {
  ForbiddenError,
  NotFoundError,
} from '../../../domain/errors/domain-error';
import {
  ACCESS_LOG_REPOSITORY,
  type AccessLogRepository,
} from '../../../domain/repositories/access-log.repository';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../domain/repositories/user.repository';

export interface LaunchAppOutput {
  app: SuiteApp;
  url: string;
  credentials: SuiteApp['credentials'];
  launchedAt: Date;
}

@Injectable()
export class LaunchAppUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
    @Inject(ACCESS_LOG_REPOSITORY)
    private readonly accessLogRepo: AccessLogRepository,
  ) {}

  async execute(input: {
    userId: string;
    appSlug: string;
  }): Promise<LaunchAppOutput> {
    const user = await this.userRepo.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const app = findSuiteApp(input.appSlug);
    if (!app) {
      throw new NotFoundError('App', 'Sistema não encontrado no catálogo');
    }

    if (!isAppEntitled(user, app.slug)) {
      throw new ForbiddenError(
        `O pacote ${user.packageSlug} não inclui ${app.name}`,
      );
    }

    const log = await this.accessLogRepo.create({
      userId: user.id,
      appSlug: app.slug,
    });

    return {
      app,
      url: app.url,
      credentials: app.credentials,
      launchedAt: log.launchedAt,
    };
  }
}

@Injectable()
export class ListAccessLogsUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
    @Inject(ACCESS_LOG_REPOSITORY)
    private readonly accessLogRepo: AccessLogRepository,
  ) {}

  async execute(input: {
    actorId: string;
    page?: number;
    perPage?: number;
  }): Promise<{
    items: AccessLog[];
    total: number;
    page: number;
    perPage: number;
  }> {
    const actor = await this.userRepo.findById(input.actorId);
    if (!actor) {
      throw new NotFoundError('User');
    }

    const page = Math.max(1, input.page ?? 1);
    const perPage = Math.min(50, Math.max(1, input.perPage ?? 20));
    const scopedToUser = actor.role === 'MEMBER' ? actor.id : undefined;

    return this.accessLogRepo.list({
      userId: scopedToUser,
      page,
      perPage,
    });
  }
}
