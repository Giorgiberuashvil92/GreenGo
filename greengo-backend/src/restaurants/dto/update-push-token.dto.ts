import { IsIn, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class UpdateRestaurantPushTokenDto {
  @ValidateIf((value: UpdateRestaurantPushTokenDto) => !value.pushToken)
  @IsString()
  @MinLength(1)
  fcmToken?: string;

  @ValidateIf((value: UpdateRestaurantPushTokenDto) => !value.fcmToken)
  @IsString()
  @MinLength(1)
  pushToken?: string;

  @IsOptional()
  @IsIn(['ios', 'android'])
  pushPlatform?: 'ios' | 'android';
}
