import { Body, Controller, Get, Post, Redirect } from '@nestjs/common';
import { FlittService } from './flitt.service';

@Controller('payments/flitt')
export class FlittController {
  constructor(private readonly flittService: FlittService) {}

  @Post('callback')
  callback(@Body() payload: Record<string, unknown>) {
    return this.flittService.processCallback(payload);
  }

  @Get('return')
  @Redirect('greengo://payment-result', 302)
  returnToApp() {
    return;
  }
}
