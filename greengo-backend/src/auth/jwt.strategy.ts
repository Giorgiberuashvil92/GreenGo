import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

export type JwtRequestUser =
  | {
      type: 'business';
      userId: string;
      restaurantId: string;
      businessUsername?: string;
    }
  | {
      type: 'customer';
      userId: string;
      phoneNumber?: string;
    };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: any): Promise<JwtRequestUser> {
    if (payload?.type === 'business') {
      const restaurantId = payload.restaurantId || payload.sub;
      if (!restaurantId) {
        throw new UnauthorizedException();
      }
      return {
        type: 'business',
        userId: String(payload.sub || restaurantId),
        restaurantId: String(restaurantId),
        businessUsername: payload.businessUsername,
      };
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    const userId = (user as any)._id?.toString() || (user as any).id?.toString();
    return {
      type: 'customer',
      userId,
      phoneNumber: user.phoneNumber,
    };
  }
}
