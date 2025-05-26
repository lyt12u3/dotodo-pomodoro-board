import { IsISO8601, IsInt, IsNotEmpty, IsOptional, IsString, Min, IsEnum } from 'class-validator';

export enum PomodoroStatus {
  STARTED = 'STARTED',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreatePomodoroDto {
  @IsISO8601()
  @IsNotEmpty()
  startTime: Date;

  @IsInt()
  @Min(1) // Duration in minutes, for example
  @IsNotEmpty()
  duration: number;

  @IsEnum(PomodoroStatus)
  @IsNotEmpty()
  status: PomodoroStatus;

  @IsString()
  @IsOptional()
  taskId?: string;
} 