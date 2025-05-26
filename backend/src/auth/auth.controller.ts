import { Controller, Post, Body, Res, HttpStatus, Get, Req, UseGuards, HttpCode, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service'; // Corrected path
import { RegisterAuthDto } from './dto/register-auth.dto'; // Corrected path
import { LoginAuthDto } from './dto/login-auth.dto'; // Corrected path
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Corrected path
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard'; // Corrected path
import * as ms from 'ms';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string | null;
    refreshToken?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private _setRefreshTokenCookie(response: Response, refreshToken: string) {
    const refreshExpirationStr = this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME');
    if (!refreshExpirationStr) {
      throw new InternalServerErrorException('JWT_REFRESH_EXPIRATION_TIME is not configured.');
    }
    const refreshExpiresInMs = ms(refreshExpirationStr as any);
    if (typeof refreshExpiresInMs !== 'number'){
        throw new InternalServerErrorException('Invalid JWT_REFRESH_EXPIRATION_TIME format. Ensure it is like \'7d\', \'1h\', or a number of milliseconds as a string e.g. \'60000\'.');
    }
    const refreshExpires = new Date(Date.now() + refreshExpiresInMs);
    
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      expires: refreshExpires,
    });
  }

  @Post('register')
  async register(@Body() registerDto: RegisterAuthDto, @Res({ passthrough: true }) response: Response) {
    try {
      const user = await this.authService.register(registerDto);
      return {
        message: 'Registration successful',
        user,
      };
    } catch (error: any) {
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
      this._setRefreshTokenCookie(response, result.refreshToken);
      
      return { message: 'Login successful', accessToken: result.accessToken, user: result.user };
    } catch (error: any) {
      if (error.status === HttpStatus.UNAUTHORIZED) {
        response.status(HttpStatus.UNAUTHORIZED).send({ message: error.message });
      } else {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: error.message || 'Login failed' });
      }
      return;
    }
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) response: Response) {
    const userId = req.user.id;
    const refreshTokenFromCookie = req.user.refreshToken;
    if (!refreshTokenFromCookie) {
        throw new InternalServerErrorException('Refresh token not found in user payload after guard validation.');
    }

    try {
      const result = await this.authService.refreshTokens(userId, refreshTokenFromCookie);
      this._setRefreshTokenCookie(response, result.refreshToken);
      return { message: 'Tokens refreshed successfully', accessToken: result.accessToken, user: result.user };
    } catch (error: any) {
        response.status(HttpStatus.UNAUTHORIZED).send({ message: error.message || 'Failed to refresh tokens' });
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
      path: '/',
      expires: new Date(0),
    });
    response.cookie('refresh_token', '', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });
    return { message: 'Logout successful' };
  }
  // Removed duplicate getProfile endpoint earlier
} 