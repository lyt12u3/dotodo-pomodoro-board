import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Priority, TaskCategory } from '@prisma/client';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskCategory)
  @IsOptional()
  category?: TaskCategory;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
} 