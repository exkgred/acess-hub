import { LaunchAppUseCase, ListAccessLogsUseCase } from './launch-app.use-case';
import {
  ForbiddenError,
  NotFoundError,
} from '../../../domain/errors/domain-error';
import type { UserRepository } from '../../../domain/repositories/user.repository';
import type { AccessLogRepository } from '../../../domain/repositories/access-log.repository';
import type { User } from '../../../domain/entities/user.entity';

function mockUserRepo(): jest.Mocked<UserRepository> {
  return {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    create: jest.fn(),
    updatePackage: jest.fn(),
    toPublic: jest.fn(),
  };
}

function mockLogRepo(): jest.Mocked<AccessLogRepository> {
  return {
    create: jest.fn(),
    list: jest.fn(),
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

describe('LaunchAppUseCase', () => {
  it('usuário inexistente → NotFoundError', async () => {
    const userRepo = mockUserRepo();
    userRepo.findById.mockResolvedValue(null);
    const useCase = new LaunchAppUseCase(userRepo, mockLogRepo());
    await expect(
      useCase.execute({ userId: 'x', appSlug: 'vendacore' }),
    ).rejects.toThrow(NotFoundError);
  });

  it('sistema inexistente → NotFoundError', async () => {
    const userRepo = mockUserRepo();
    userRepo.findById.mockResolvedValue(member);
    const useCase = new LaunchAppUseCase(userRepo, mockLogRepo());
    await expect(
      useCase.execute({ userId: member.id, appSlug: 'folha' }),
    ).rejects.toThrow(NotFoundError);
  });

  it('módulo fora do pacote → ForbiddenError', async () => {
    const userRepo = mockUserRepo();
    userRepo.findById.mockResolvedValue(member);
    const useCase = new LaunchAppUseCase(userRepo, mockLogRepo());
    await expect(
      useCase.execute({ userId: member.id, appSlug: 'discador' }),
    ).rejects.toThrow(ForbiddenError);
  });

  it('módulo do pacote → registra auditoria e devolve URL', async () => {
    const userRepo = mockUserRepo();
    const logRepo = mockLogRepo();
    userRepo.findById.mockResolvedValue(member);
    const launchedAt = new Date();
    logRepo.create.mockResolvedValue({
      id: 'log-1',
      userId: member.id,
      appSlug: 'vendacore',
      launchedAt,
    });
    const useCase = new LaunchAppUseCase(userRepo, logRepo);
    const result = await useCase.execute({
      userId: member.id,
      appSlug: 'vendacore',
    });
    expect(result.url).toContain('reat-erp.vercel.app');
    expect(result.credentials?.email).toBe('admin@vendacore.com');
    expect(result.launchedAt).toBe(launchedAt);
  });
});

describe('ListAccessLogsUseCase', () => {
  it('usuário inexistente → NotFoundError', async () => {
    const userRepo = mockUserRepo();
    userRepo.findById.mockResolvedValue(null);
    const useCase = new ListAccessLogsUseCase(userRepo, mockLogRepo());
    await expect(useCase.execute({ actorId: 'x' })).rejects.toThrow(
      NotFoundError,
    );
  });

  it('member → filtra pelos próprios lançamentos', async () => {
    const userRepo = mockUserRepo();
    const logRepo = mockLogRepo();
    userRepo.findById.mockResolvedValue(member);
    logRepo.list.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      perPage: 20,
    });
    const useCase = new ListAccessLogsUseCase(userRepo, logRepo);
    await useCase.execute({ actorId: member.id });
    expect(logRepo.list).toHaveBeenCalledWith({
      userId: member.id,
      page: 1,
      perPage: 20,
    });
  });

  it('recruiter → vê a suíte inteira e respeita paginação', async () => {
    const userRepo = mockUserRepo();
    const logRepo = mockLogRepo();
    userRepo.findById.mockResolvedValue(recruiter);
    logRepo.list.mockResolvedValue({
      items: [],
      total: 0,
      page: 2,
      perPage: 50,
    });
    const useCase = new ListAccessLogsUseCase(userRepo, logRepo);
    await useCase.execute({ actorId: recruiter.id, page: 0, perPage: 999 });
    expect(logRepo.list).toHaveBeenCalledWith({
      userId: undefined,
      page: 1,
      perPage: 50,
    });
  });
});
