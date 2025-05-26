import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { PomodoroService } from './pomodoro.service';
import { CreatePomodoroDto } from './dto/create-pomodoro.dto';
import { UpdatePomodoroDto } from './dto/update-pomodoro.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { PomodoroSession } from '../../prisma/generated/client'; // Adjusted import path
import { Request } from 'express'; // Added import for Request type

// Re-using or defining a similar AuthenticatedRequest type as in TasksController
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

@Controller('pomodoro-sessions') // Changed endpoint to be more descriptive
@UseGuards(JwtAuthGuard)
export class PomodoroController {
  constructor(private readonly pomodoroService: PomodoroService) {}

  @Post()
  create(@Body() createPomodoroDto: CreatePomodoroDto, @Req() req: AuthenticatedRequest): Promise<PomodoroSession> {
    return this.pomodoroService.create(createPomodoroDto, req.user.id);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest): Promise<PomodoroSession[]> {
    return this.pomodoroService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest): Promise<PomodoroSession> {
    return this.pomodoroService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePomodoroDto: UpdatePomodoroDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<PomodoroSession> {
    return this.pomodoroService.update(id, updatePomodoroDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest): Promise<PomodoroSession> {
    return this.pomodoroService.remove(id, req.user.id);
  }
} 