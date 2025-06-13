import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsInt()
  @Min(1)
  @Max(120)
  @IsOptional()
  workInterval?: number;

  @IsInt()
  @Min(1)
  @Max(30)
  @IsOptional()
  breakInterval?: number;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  intervalsCount?: number;
} 