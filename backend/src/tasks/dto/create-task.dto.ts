import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

// Assuming a TaskStatus enum might exist or be defined in Prisma schema
// For now, let's define a placeholder or you can adjust it based on your actual TaskStatus enum
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TaskCategory {
  TODAY = 'today',
  TOMORROW = 'tomorrow',
  THIS_WEEK = 'this-week',
  NEXT_WEEK = 'next-week',
  LATER = 'later',
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskCategory)
  @IsNotEmpty()
  category: TaskCategory;
} 