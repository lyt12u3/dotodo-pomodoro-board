import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjusted path for future PrismaService location
import type { User } from '../../prisma/generated/client'; // Adjusted path

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findOneById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const { password, ...updateData } = data;
    if (password) {
      console.warn('Password update attempted through generic updateUser. Implement specific password change logic.');
    }
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }
} 