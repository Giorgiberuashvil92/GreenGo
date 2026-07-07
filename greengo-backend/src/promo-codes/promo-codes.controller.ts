import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { ValidatePromoCodeDto } from './dto/validate-promo-code.dto';
import { PromoCodesService } from './promo-codes.service';

@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Post()
  create(@Body() createPromoCodeDto: CreatePromoCodeDto) {
    return this.promoCodesService.create(createPromoCodeDto);
  }

  @Post('validate')
  validate(@Body() validatePromoCodeDto: ValidatePromoCodeDto) {
    return this.promoCodesService.validate(
      validatePromoCodeDto.code,
      validatePromoCodeDto.subtotal,
      validatePromoCodeDto.deliveryFee ?? 0,
      validatePromoCodeDto.serviceFee ?? 0,
    );
  }

  @Get()
  findAll() {
    return this.promoCodesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promoCodesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePromoCodeDto: UpdatePromoCodeDto,
  ) {
    return this.promoCodesService.update(id, updatePromoCodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promoCodesService.remove(id);
  }
}
