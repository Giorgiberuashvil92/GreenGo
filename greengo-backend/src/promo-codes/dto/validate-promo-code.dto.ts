import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ValidatePromoCodeDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  deliveryFee?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  serviceFee?: number;
}
