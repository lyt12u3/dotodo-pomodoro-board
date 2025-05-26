import { Controller, Post, Body, Res, HttpStatus, Get, Req, UseGuards, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './auth/dto/register-auth.dto';
import { LoginAuthDto } from './auth/dto/login-auth.dto';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterAuthDto, @Res({ passthrough: true }) response: Response) {
    try {
      const user = await this.authService.register(registerDto);
      return {
        message: 'Registration successful',
        user,
      };
    } catch (error) {
      // Handle potential errors from AuthService (e.g., ConflictException)
      if (error.status === HttpStatus.CONFLICT) {
        response.status(HttpStatus.CONFLICT).send({ message: error.message });
      } else {
        response.status(HttpStatus.BAD_REQUEST).send({ message: error.message || 'Registration failed' });
      }
      return; 
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginAuthDto, @Res({ passthrough: true }) response: Response) {
    try {
      const result = await this.authService.login(loginDto);
      
      const cookieName = 'access_token';
      const cookieValue = result.access_token;
      const expiresInSeconds = parseInt(this.configService.get<string>('JWT_EXPIRATION_TIME') || '3600', 10);
      const expires = new Date(Date.now() + expiresInSeconds * 1000);

      response.cookie(cookieName, cookieValue, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        expires: expires,
      });
      
      return { message: 'Login successful', user: result.user };
    } catch (error) {
      if (error.status === HttpStatus.UNAUTHORIZED) {
        response.status(HttpStatus.UNAUTHORIZED).send({ message: error.message });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Login failed' });
      }
      return;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('access_token', '', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      expires: new Date(0),
    });
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return (req as any).user;
  }
}
