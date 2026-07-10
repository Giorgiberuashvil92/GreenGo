import { IsString } from 'class-validator';

export class CopyMenuDto {
  @IsString()
  sourceRestaurantId: string;
}
