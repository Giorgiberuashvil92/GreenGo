import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * თუ Authorization header არის — JWT უნდა იყოს ვალიდური.
 * თუ header არ არის — request გრძელდება (admin / public / mobile).
 * Business JWT-ის შემთხვევაში req.user.type === 'business'.
 */
@Injectable()
export class OptionalJwtAuthGuard
  extends AuthGuard('jwt')
  implements CanActivate
{
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    if (!authHeader) {
      return true;
    }

    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err) {
      throw err;
    }
    return user;
  }
}
