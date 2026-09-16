import { Inject, Injectable } from '@nestjs/common';
import type {
  PackageSlug,
  PublicUser,
} from '../../../domain/entities/user.entity';
import {
  ForbiddenError,
  NotFoundError,
} from '../../../domain/errors/domain-error';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../domain/repositories/user.repository';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
  ) {}

  async execute(input: {
    actorRole: PublicUser['role'];
  }): Promise<PublicUser[]> {
    if (input.actorRole === 'MEMBER') {
      throw new ForbiddenError('Sem permissão para listar pessoas');
    }
    const users = await this.userRepo.list();
    return users.map((user) => this.userRepo.toPublic(user));
  }
}

@Injectable()
export class UpdateUserPackageUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
  ) {}

  async execute(input: {
    actorRole: PublicUser['role'];
    userId: string;
    packageSlug: PackageSlug;
  }): Promise<PublicUser> {
    if (input.actorRole !== 'ADMIN') {
      throw new ForbiddenError('Apenas administradores alteram pacotes');
    }
    const user = await this.userRepo.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    const updated = await this.userRepo.updatePackage(
      input.userId,
      input.packageSlug,
    );
    return this.userRepo.toPublic(updated);
  }
}
