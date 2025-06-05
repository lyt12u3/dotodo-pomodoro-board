import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../../users/users.service'; // Updated path: src/auth/strategies -> src/users/
import type { User } from '../../../prisma/generated/client'; // Updated path: src/auth/strategies -> prisma/

// Helper function to extract JWT from cookie
const cookieExtractor = (req: Request): string | null => {
  return req && req.cookies ? (req.cookies['access_token'] as string | null) : null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') { // Use 'jwt' as the default name
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService, 
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      // This will stop the application from starting if JWT_SECRET is not set.
      // Consider a more graceful shutdown or logging in a real-world scenario.
      throw new InternalServerErrorException('JWT_SECRET environment variable is not set.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  // Payload is the decoded JWT (from AuthService: { email: user.email, sub: user.id, name: user.name })
  async validate(payload: { sub: string; email: string; name: string }): Promise<Omit<User, 'password'> | null> { // Refined return type
    if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
    }
    const user = await this.usersService.findOneById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found or token invalid');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user; // Exclude password from the object returned to req.user
    return result; // This will be attached to req.user
  }
} 