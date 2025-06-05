import { Controller, Get, UseGuards, Req, Patch, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Adjusted path
import { Request } from 'express';
import type { User } from '../../prisma/generated/client'; // Adjusted path
import { UsersService } from './users.service';

interface AuthenticatedUserPayload {
  id: string;
  email: string;
  name: string;
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUserPayload;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: AuthenticatedRequest): AuthenticatedUserPayload {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('settings')
  async getSettings(@Req() req: AuthenticatedRequest) {
    const user = await this.usersService.findOneById(req.user.id);
    if (!user) throw new Error('User not found');
    return {
      workInterval: user.workInterval,
      breakInterval: user.breakInterval,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('settings')
  async updateSettings(@Req() req: AuthenticatedRequest, @Body() body: { workInterval?: number; breakInterval?: number }) {
    const updated = await this.usersService.updateUser(req.user.id, body);
    if (!updated) throw new Error('User not found');
    return {
      workInterval: updated.workInterval,
      breakInterval: updated.breakInterval,
    };
  }
} 