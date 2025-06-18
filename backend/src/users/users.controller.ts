import { Controller, Get, UseGuards, Req, Patch, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '@prisma/client';
import { UsersService } from './users.service';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

interface UserSettings {
  name: string | null;
  language: string;
  workInterval: number | null;
  breakInterval: number | null;
  intervalsCount: number | null;
}

interface AuthenticatedUserPayload {
  id: string;
  email: string;
  name: string | null;
  language: string;
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUserPayload;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: AuthenticatedRequest): AuthenticatedUserPayload {
    return req.user;
  }

  // @UseGuards(JwtAuthGuard)
  @Get('settings')
  async getSettings(@Req() req: AuthenticatedRequest): Promise<UserSettings> {
    const user = await this.usersService.findOneById(req.user.id);
    if (!user) throw new Error('User not found');
    return {
      name: user.name,
      language: user.language,
      workInterval: user.workInterval,
      breakInterval: user.breakInterval,
      intervalsCount: user.intervalsCount,
    };
  }

  // @UseGuards(JwtAuthGuard)
  @Patch('settings')
  async updateSettings(@Req() req: AuthenticatedRequest, @Body() body: UpdateUserSettingsDto): Promise<UserSettings> {
    const updated = await this.usersService.updateUser(req.user.id, body);
    if (!updated) throw new Error('User not found');
    return {
      name: updated.name,
      language: updated.language,
      workInterval: updated.workInterval,
      breakInterval: updated.breakInterval,
      intervalsCount: updated.intervalsCount,
    };
  }
} 
