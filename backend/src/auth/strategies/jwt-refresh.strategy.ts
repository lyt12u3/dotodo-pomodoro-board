import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service'; // Updated path

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService, // To validate user existence
  ) {
    const refreshSecret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      // This will stop the application from starting if JWT_REFRESH_SECRET is not set.
      throw new InternalServerErrorException('JWT_REFRESH_SECRET environment variable is not set.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.['refresh_token']; // Extract from cookie
        },
      ]),
      secretOrKey: refreshSecret, // Ensure this is not undefined
      passReqToCallback: true, // Pass request to validate method to access token itself
      ignoreExpiration: false, // Explicitly set ignoreExpiration
    } as StrategyOptionsWithRequest); // Explicitly cast to StrategyOptionsWithRequest
  }

  async validate(req: Request, payload: { sub: string; email: string; name: string }) {
    // Payload is the decoded refresh JWT
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }
    const user = await this.usersService.findOneById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found for refresh token');
    }
    
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found in request');
    }

    // Here we could add logic to compare the incoming refresh token with a stored one if we were hashing/storing them
    // For a stateless JWT approach, the signature validation is key.
    // We return user and the refresh token itself so the service can decide on rotation or further checks.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, refreshToken };
  }
} 