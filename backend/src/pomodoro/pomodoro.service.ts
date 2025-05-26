import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePomodoroDto, PomodoroStatus } from './dto/create-pomodoro.dto';
import { UpdatePomodoroDto } from './dto/update-pomodoro.dto';
import { Prisma, PomodoroSession } from '@prisma/client';

@Injectable()
export class PomodoroService {
  constructor(private prisma: PrismaService) {}

  async create(createPomodoroDto: CreatePomodoroDto, userId: string): Promise<PomodoroSession> {
    // Optionally, verify taskId if provided and belongs to the user
    if (createPomodoroDto.taskId) {
      const task = await this.prisma.task.findUnique({ where: { id: createPomodoroDto.taskId } });
      if (!task || task.userId !== userId) {
        throw new ForbiddenException('Invalid taskId or task does not belong to user');
      }
    }
    return this.prisma.pomodoroSession.create({
      data: {
        ...createPomodoroDto,
        userId,
      },
    });
  }

  async findAll(userId: string): Promise<PomodoroSession[]> {
    return this.prisma.pomodoroSession.findMany({
      where: { userId },
    });
  }

  async findOne(id: string, userId: string): Promise<PomodoroSession> {
    const pomodoroSession = await this.prisma.pomodoroSession.findUnique({
      where: { id },
    });

    if (!pomodoroSession) {
      throw new NotFoundException(`PomodoroSession with ID "${id}" not found`);
    }

    if (pomodoroSession.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this session');
    }
    return pomodoroSession;
  }

  async update(id: string, updatePomodoroDto: UpdatePomodoroDto, userId: string): Promise<PomodoroSession> {
    await this.findOne(id, userId); // Ensures session exists and user has permission

    const dataToUpdate: Prisma.PomodoroSessionUpdateInput = {};
    if (updatePomodoroDto.status !== undefined) {
      dataToUpdate.isCompleted = updatePomodoroDto.status === PomodoroStatus.COMPLETED;
    }
    // If updatePomodoroDto.startTime or updatePomodoroDto.duration are meant to update
    // properties on PomodoroSession or related entities, that logic needs to be added here.

    return this.prisma.pomodoroSession.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string, userId: string): Promise<PomodoroSession> {
    await this.findOne(id, userId); // Ensures session exists and user has permission
    return this.prisma.pomodoroSession.delete({
      where: { id },
    });
  }
} 