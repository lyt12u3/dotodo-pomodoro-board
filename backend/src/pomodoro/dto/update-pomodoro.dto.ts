import { IsISO8601, IsInt, IsOptional, Min, IsEnum } from 'class-validator';
import { PomodoroStatus } from './create-pomodoro.dto';

export class UpdatePomodoroDto {
  @IsISO8601()
  @IsOptional()
  startTime?: Date;

  @IsInt()
  @Min(1)
  @IsOptional()
  duration?: number;

  @IsEnum(PomodoroStatus)
  @IsOptional()
  status?: PomodoroStatus;
  // taskId is usually not updatable, or handled via a separate endpoint if linking/unlinking is needed
} 