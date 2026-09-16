import { Injectable } from '@nestjs/common';
import type {
  PublicUser,
  User,
  UserRole,
  PackageSlug,
} from '../../domain/entities/user.entity';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? this.toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async list(): Promise<User[]> {
    const rows = await this.prisma.user.findMany({ orderBy: { name: 'asc' } });
    return rows.map((row) => this.toDomain(row));
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    packageSlug: PackageSlug;
  }): Promise<User> {
    const row = await this.prisma.user.create({ data });
    return this.toDomain(row);
  }

  async updatePackage(id: string, packageSlug: PackageSlug): Promise<User> {
    const row = await this.prisma.user.update({
      where: { id },
      data: { packageSlug },
    });
    return this.toDomain(row);
  }

  toPublic(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      packageSlug: user.packageSlug,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toDomain(row: User): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role,
      packageSlug: row.packageSlug,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
