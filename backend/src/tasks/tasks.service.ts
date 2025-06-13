import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Prisma, Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const dataToCreate: Prisma.TaskCreateInput = {
      user: { connect: { id: userId } },
      name: createTaskDto.name,
      description: createTaskDto.description,
      category: createTaskDto.category,
      isCompleted: createTaskDto.isCompleted ?? false,
      priority: createTaskDto.priority,
    };

    return this.prisma.task.create({
      data: dataToCreate,
    });
  }

  async findAll(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Task> {
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
    await this.findOne(id, userId);

    const dataToUpdate: Prisma.TaskUpdateInput = {};
    
    if (updateTaskDto.name !== undefined) {
      dataToUpdate.name = updateTaskDto.name;
    }
    
    if (updateTaskDto.description !== undefined) {
      dataToUpdate.description = updateTaskDto.description;
    }
    
    if (updateTaskDto.isCompleted !== undefined) {
      dataToUpdate.isCompleted = updateTaskDto.isCompleted;
    }
    
    if (updateTaskDto.category !== undefined) {
      dataToUpdate.category = updateTaskDto.category;
    }
    
    if (updateTaskDto.priority !== undefined) {
      dataToUpdate.priority = updateTaskDto.priority;
    }

    console.log('Updating task with data:', dataToUpdate);
    
    return this.prisma.task.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string, userId: string): Promise<Task> {
    await this.findOne(id, userId);
    return this.prisma.task.delete({
      where: { id },
    });
  }
} 