import { IsIn, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class UpdatePushTokenDto {
  @ValidateIf((o: UpdatePushTokenDto) => !o.pushToken)
  @IsString()
  @MinLength(10)
  fcmToken?: string;

  @ValidateIf((o: UpdatePushTokenDto) => !o.fcmToken)
  @IsString()
  @MinLength(10)
  pushToken?: string;

  @IsOptional()
  @IsIn(['ios', 'android'])
  pushPlatform?: 'ios' | 'android';
}
