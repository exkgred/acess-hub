import { Inject, Injectable } from '@nestjs/common';
import type { PublicUser } from '../../../domain/entities/user.entity';
import { NotFoundError } from '../../../domain/errors/domain-error';
import {
  findSuitePackage,
  isAppEntitled,
  SUITE_APPS,
  SUITE_PACKAGES,
  type SuiteApp,
  type SuitePackage,
} from '../../../domain/catalog/suite-catalog';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../domain/repositories/user.repository';

export interface CatalogApp extends SuiteApp {
  entitled: boolean;
}

export interface WorkspaceOutput {
  user: PublicUser;
  package: SuitePackage;
  packages: SuitePackage[];
  apps: CatalogApp[];
}

@Injectable()
export class GetWorkspaceUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
  ) {}

  async execute(input: { userId: string }): Promise<WorkspaceOutput> {
    const user = await this.userRepo.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    return {
      user: this.userRepo.toPublic(user),
      package: findSuitePackage(user.packageSlug),
      packages: SUITE_PACKAGES,
      apps: SUITE_APPS.map((app) => ({
        ...app,
        entitled: isAppEntitled(user, app.slug),
      })),
    };
  }
}
