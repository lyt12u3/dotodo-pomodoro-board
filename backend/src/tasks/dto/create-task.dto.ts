import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Priority, TaskCategory } from '@prisma/client';

// Assuming a TaskStatus enum might exist or be defined in Prisma schema
// For now, let's define a placeholder or you can adjust it based on your actual TaskStatus enum
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskCategory)
  @IsNotEmpty()
  category: TaskCategory;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
} 