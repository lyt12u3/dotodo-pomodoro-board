import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TaskStatus } from './create-task.dto'; // Assuming TaskStatus is defined here or in Prisma

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
} 