import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Task } from '@prisma/client';
import { Request } from 'express';

// Define a type for the authenticated request
interface AuthenticatedRequest extends Request {
  user: {
    id: string; // Assuming user ID is a string (e.g., UUID)
    // Add other user properties if needed from the JWT payload
    email: string;
    name: string;
  };
}

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: AuthenticatedRequest): Promise<Task> {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest): Promise<Task[]> {
    return this.tasksService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest): Promise<Task> {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest): Promise<Task> {
    return this.tasksService.remove(id, req.user.id);
  }
} 