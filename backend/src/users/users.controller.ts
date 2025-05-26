import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Adjusted path
import { Request } from 'express';
import type { User } from '../../prisma/generated/client'; // Adjusted path

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
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: AuthenticatedRequest): AuthenticatedUserPayload {
    return req.user;
  }
} 