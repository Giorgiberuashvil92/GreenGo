import {
  ForbiddenException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import type { JwtRequestUser } from './jwt.strategy';

export function getBusinessRestaurantId(
  user: JwtRequestUser | undefined | null,
): string | null {
  if (user && user.type === 'business') {
    return user.restaurantId;
  }
  return null;
}

export function assertBusinessRestaurantAccess(
  user: JwtRequestUser | undefined | null,
  resourceRestaurantId: string | undefined | null,
): void {
  const businessRestaurantId = getBusinessRestaurantId(user);
  if (!businessRestaurantId) {
    return;
  }

  const normalizedResource = String(resourceRestaurantId ?? '');
  if (!normalizedResource || normalizedResource !== businessRestaurantId) {
    throw new ForbiddenException(
      'ამ რესტორნის მონაცემებზე წვდომა არ გაქვთ',
    );
  }
}

export function resolveRestaurantIdForBusiness(
  user: JwtRequestUser | undefined | null,
  requestedRestaurantId?: string,
): string | undefined {
  const businessRestaurantId = getBusinessRestaurantId(user);
  if (!businessRestaurantId) {
    return requestedRestaurantId;
  }

  if (
    requestedRestaurantId &&
    requestedRestaurantId !== businessRestaurantId
  ) {
    throw new ForbiddenException(
      'ამ რესტორნის მონაცემებზე წვდომა არ გაქვთ',
    );
  }

  return businessRestaurantId;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtRequestUser | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtRequestUser | undefined;
  },
);
