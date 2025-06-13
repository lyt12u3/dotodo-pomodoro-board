import { IsString, IsOptional, IsInt, Min, Max, Matches, IsEnum } from 'class-validator';

enum Language {
  ENG = 'eng',
  UA = 'ua'
}

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/, {
    message: 'Name can only contain letters, spaces and hyphens. Numbers and special characters are not allowed.'
  })
  name?: string;

  @IsOptional()
  @IsEnum(Language, {
    message: 'Language must be either "eng" or "ua"'
  })
  language?: Language;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  workInterval?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  breakInterval?: number;
} 