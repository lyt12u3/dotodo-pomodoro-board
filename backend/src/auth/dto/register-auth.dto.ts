import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

enum Language {
  ENG = 'eng',
  UA = 'ua'
}

export class RegisterAuthDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email should not be empty.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password should not be empty.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Name should not be empty.' })
  name?: string; // Optional based on your Prisma schema (name is String?)

  @IsOptional()
  @IsEnum(Language, {
    message: 'Language must be either "eng" or "ua"'
  })
  language?: Language = Language.ENG;
} 