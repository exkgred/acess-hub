export type UserRole = 'ADMIN' | 'RECRUITER' | 'MEMBER';
export type PackageSlug = 'FULL' | 'COMERCIAL' | 'OPERACAO';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  packageSlug: PackageSlug;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Omit<User, 'passwordHash'>;
