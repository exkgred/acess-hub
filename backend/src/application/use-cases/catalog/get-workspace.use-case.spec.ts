import { GetWorkspaceUseCase } from './get-workspace.use-case';
import { NotFoundError } from '../../../domain/errors/domain-error';
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
  email: 'comercial@atrio.dev',
  passwordHash: 'hash',
  role: 'MEMBER',
  packageSlug: 'COMERCIAL',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const recruiter: User = {
  ...member,
  id: 'r1',
  name: 'Recrutador',
  email: 'recruiter@atrio.dev',
  role: 'RECRUITER',
  packageSlug: 'FULL',
};

describe('GetWorkspaceUseCase', () => {
  it('usuário inexistente → NotFoundError', async () => {
    const userRepo = mockUserRepo();
    userRepo.findById.mockResolvedValue(null);
    const useCase = new GetWorkspaceUseCase(userRepo);
    await expect(useCase.execute({ userId: 'x' })).rejects.toThrow(
      NotFoundError,
    );
  });

  it('member comercial → ERP, CRM, loja e chat', async () => {
    const userRepo = mockUserRepo();
    userRepo.findById.mockResolvedValue(member);
    const useCase = new GetWorkspaceUseCase(userRepo);
    const result = await useCase.execute({ userId: member.id });
    const unlocked = result.apps
      .filter((app) => app.entitled)
      .map((app) => app.slug);
    expect(result.package.slug).toBe('COMERCIAL');
    expect(unlocked).toEqual(['vendacore', 'nexo', 'smarty', 'chat']);
    expect(result.apps.find((app) => app.slug === 'discador')?.entitled).toBe(
      false,
    );
  });

  it('recruiter → todos os sistemas liberados', async () => {
    const userRepo = mockUserRepo();
    userRepo.findById.mockResolvedValue(recruiter);
    const useCase = new GetWorkspaceUseCase(userRepo);
    const result = await useCase.execute({ userId: recruiter.id });
    expect(result.apps.every((app) => app.entitled)).toBe(true);
    expect(result.packages).toHaveLength(3);
  });

  it('admin → todos os sistemas liberados', async () => {
    const userRepo = mockUserRepo();
    userRepo.findById.mockResolvedValue({
      ...recruiter,
      id: 'a1',
      role: 'ADMIN',
      email: 'admin@atrio.dev',
    });
    const useCase = new GetWorkspaceUseCase(userRepo);
    const result = await useCase.execute({ userId: 'a1' });
    expect(result.apps.every((app) => app.entitled)).toBe(true);
  });
});
