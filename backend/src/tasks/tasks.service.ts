import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import type { Task } from '../../prisma/generated/client'; // Path should be correct relative to src/tasks/

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    return this.prisma.task.create({
      data: {
        ...createTaskDto,
        userId,
      },
    });
  }

  async findAll(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { userId },
    });
  }

  async findOne(id: string, userId: string): Promise<Task> { // Return type changed to Task, null check handled by throw
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this task');
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    await this.findOne(id, userId); // Ensures task exists and user has permission by calling findOne
    return this.prisma.task.update({
      where: { id }, // id is already validated to belong to the user by findOne
      data: updateTaskDto,
    });
  }

  async remove(id: string, userId: string): Promise<Task> {
    await this.findOne(id, userId); // Ensures task exists and user has permission
    return this.prisma.task.delete({
      where: { id }, // id is already validated to belong to the user by findOne
    });
  }
} 