import { IsString, Length, Matches } from 'class-validator';

export class LoginCourierDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/)
  verificationCode: string;
}
