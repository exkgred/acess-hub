import {
  ListUsersUseCase,
  UpdateUserPackageUseCase,
} from './manage-users.use-case';
import {
  ForbiddenError,
  NotFoundError,
} from '../../../domain/errors/domain-error';
import type { UserRepository } from '../../../domain/repositories/user.repository';
import type { User } from '../../../domain/entities/user.entity';

function mockUserRepo(): jest.Mocked<UserRepository> {
  return {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    create: jest.fn(),
    updatePackage: jest.fn(),
    toPublic: jest.fn((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      packageSlug: user.packageSlug,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })),
  };
}

const member: User = {
  id: 'm1',
  name: 'Ana',
  email: 'comercial@porti.dev',
  passwordHash: 'hash',
  role: 'MEMBER',
  packageSlug: 'COMERCIAL',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ListUsersUseCase', () => {
  it('member → ForbiddenError', async () => {
    const useCase = new ListUsersUseCase(mockUserRepo());
    await expect(useCase.execute({ actorRole: 'MEMBER' })).rejects.toThrow(
      ForbiddenError,
    );
  });

  it('recruiter → lista pública', async () => {
    const userRepo = mockUserRepo();
    userRepo.list.mockResolvedValue([member]);
    const useCase = new ListUsersUseCase(userRepo);
    const result = await useCase.execute({ actorRole: 'RECRUITER' });
    expect(result).toHaveLength(1);
    expect(result[0].email).toBe(member.email);
  });
});

describe('UpdateUserPackageUseCase', () => {
  it('não admin → ForbiddenError', async () => {
    const useCase = new UpdateUserPackageUseCase(mockUserRepo());
    await expect(
      useCase.execute({
        actorRole: 'RECRUITER',
        userId: member.id,
        packageSlug: 'FULL',
      }),
    ).rejects.toThrow(ForbiddenError);
  });

  it('usuário inexistente → NotFoundError', async () => {
    const userRepo = mockUserRepo();
    userRepo.findById.mockResolvedValue(null);
    const useCase = new UpdateUserPackageUseCase(userRepo);
    await expect(
      useCase.execute({
        actorRole: 'ADMIN',
        userId: 'x',
        packageSlug: 'FULL',
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('admin → atualiza pacote', async () => {
    const userRepo = mockUserRepo();
    userRepo.findById.mockResolvedValue(member);
    userRepo.updatePackage.mockResolvedValue({
      ...member,
      packageSlug: 'OPERACAO',
    });
    const useCase = new UpdateUserPackageUseCase(userRepo);
    const result = await useCase.execute({
      actorRole: 'ADMIN',
      userId: member.id,
      packageSlug: 'OPERACAO',
    });
    expect(result.packageSlug).toBe('OPERACAO');
  });
});
