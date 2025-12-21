import { IsOptional, IsString } from 'class-validator';

export class RegisterCourierDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  verificationCode: string;

  @IsString()
  @IsOptional()
  name?: string;
}

