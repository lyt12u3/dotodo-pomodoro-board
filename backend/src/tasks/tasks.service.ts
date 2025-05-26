import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, TaskStatus } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Prisma, Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const dataToCreate: Prisma.TaskCreateInput = {
      user: { connect: { id: userId } },
      name: createTaskDto.title,
    };

    if (createTaskDto.status !== undefined) {
      dataToCreate.isCompleted = createTaskDto.status === TaskStatus.COMPLETED;
    }

    return this.prisma.task.create({
      data: dataToCreate,
    });
  }

  async findAll(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { userId },
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
    if (updateTaskDto.title !== undefined) {
      dataToUpdate.name = updateTaskDto.title;
    }
    if (updateTaskDto.status !== undefined) {
      dataToUpdate.isCompleted = updateTaskDto.status === TaskStatus.COMPLETED;
    }

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