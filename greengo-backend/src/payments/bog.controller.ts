import {
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  Redirect,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import type { RawBodyRequest } from '@nestjs/common';
import { BogService } from './bog.service';
@Controller('payments/bog')
export class BogController {
  constructor(private readonly bog: BogService) {}
  @Post('callback')
  @HttpCode(200)
  callback(
    @Req() req: RawBodyRequest<Request>,
    @Headers('callback-signature') signature?: string,
  ) {
    return this.bog.processCallback(req.rawBody, signature);
  }
  @Get('return')
  @Redirect('greengo://payment-result', 302)
  returnToApp() {}
  @Get(':orderId/status')
  status(@Param('orderId') orderId: string, @Query('token') token: string) {
    return this.bog.getStatus(orderId, token);
  }
}
