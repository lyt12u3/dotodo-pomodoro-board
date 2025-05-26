import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service'; // Corrected path relative to src/auth/
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterAuthDto } from './dto/register-auth.dto'; 
import { LoginAuthDto } from './dto/login-auth.dto';   
import { PrismaService } from '../prisma/prisma.service'; // Corrected path relative to src/auth/
import type { User } from '../../prisma/generated/client'; // Corrected path relative to src/auth/

interface JwtPayload {
  email: string;
  sub: string; 
  name: string | null; 
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    if (!configService.get<string>('JWT_SECRET')) {
      throw new InternalServerErrorException('JWT_SECRET is not set.');
    }
    if (!configService.get<string>('JWT_EXPIRATION_TIME')) {
      throw new InternalServerErrorException('JWT_EXPIRATION_TIME is not set.');
    }
    if (!configService.get<string>('JWT_REFRESH_SECRET')) {
      throw new InternalServerErrorException('JWT_REFRESH_SECRET is not set.');
    }
    if (!configService.get<string>('JWT_REFRESH_EXPIRATION_TIME')) {
      throw new InternalServerErrorException('JWT_REFRESH_EXPIRATION_TIME is not set.');
    }
  }

  private async _generateTokens(payload: JwtPayload, user: Omit<User, 'password'>): Promise<Tokens & { user: Omit<User, 'password'> }> {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginAuthDto): Promise<Tokens & { user: Omit<User, 'password'> }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user || !user.id || !user.email) { 
      throw new UnauthorizedException('Invalid credentials or user data incomplete');
    }
    const payload: JwtPayload = { email: user.email, sub: user.id, name: user.name }; 
    return this._generateTokens(payload, user);
  }

  async refreshTokens(userId: string, incomingRefreshToken: string): Promise<Tokens & { user: Omit<User, 'password'> }> {
    const user = await this.usersService.findOneById(userId);
    if (!user || !user.id || !user.email) { 
      throw new UnauthorizedException('User not found or user data incomplete');
    }
    const { password, ...userWithoutPassword } = user;
    const payload: JwtPayload = { email: userWithoutPassword.email!, sub: userWithoutPassword.id!, name: userWithoutPassword.name };    
    return this._generateTokens(payload, userWithoutPassword);
  }

  async register(registerDto: RegisterAuthDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.usersService.findOneByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
      },
    });
    const { password, ...result } = newUser;
    return result;
  }
} 