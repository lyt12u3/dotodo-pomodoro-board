import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

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
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
} 