import { IsIn, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class UpdatePushTokenDto {
  /** FCM registration token (პრიორიტეტული) */
  @ValidateIf((o: UpdatePushTokenDto) => !o.pushToken)
  @IsString()
  @MinLength(10)
  fcmToken?: string;

  /** Native device token (iOS APNs / Android FCM) — fallback თუ fcmToken არ არის */
  @ValidateIf((o: UpdatePushTokenDto) => !o.fcmToken)
  @IsString()
  @MinLength(10)
  pushToken?: string;

  @IsOptional()
  @IsIn(['ios', 'android'])
  pushPlatform?: 'ios' | 'android';
}
