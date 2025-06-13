import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { TaskStatus, TaskCategory } from './create-task.dto';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @IsEnum(TaskCategory)
  @IsOptional()
  category?: TaskCategory;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;
} 