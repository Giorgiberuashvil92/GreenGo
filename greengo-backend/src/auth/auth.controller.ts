import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('send-verification-code')
  async sendVerificationCode(
    @Body() body: { phoneNumber: string; countryCode?: string },
  ) {
    const { code, sentViaSms } = await this.authService.sendVerificationCode(
      body.phoneNumber,
    );
    return {
      success: true,
      message: sentViaSms
        ? 'Verification code sent'
        : 'Verification code (dev — no SMS key)',
      ...(code !== undefined ? { code } : {}),
    };
  }

  @Post('verify-code')
  async verifyCode(
    @Body() body: { phoneNumber: string; verificationCode: string },
  ) {
    console.log('📱 VerifyCode request:', {
      phoneNumber: body.phoneNumber,
      code: body.verificationCode,
    });
    const result = await this.authService.verifyCode(
      body.phoneNumber,
      body.verificationCode,
    );
    const response = {
      success: true,
      ...result,
    };
    console.log('📤 VerifyCode response:', JSON.stringify(response, null, 2));
    return response;
  }

  @Post('business-login')
  async businessLogin(@Body() body: { username: string; password: string }) {
    const result = await this.authService.businessLogin(
      body.username,
      body.password,
    );

    return {
      success: true,
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findOne(req.user.userId);
    return {
      success: true,
      data: {
        id: (user as any)._id?.toString(),
        phoneNumber: user.phoneNumber,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
        balance: user.balance ?? 0,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    const user = await this.usersService.findOne(req.user.userId);
    return {
      success: true,
      data: {
        id: (user as any)._id?.toString(),
        phoneNumber: user.phoneNumber,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
        balance: user.balance ?? 0,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-token')
  async verifyToken(@Request() req) {
    return {
      success: true,
      user: req.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('complete-registration')
  async completeRegistration(
    @Request() req,
    @Body() body: { firstName: string; lastName: string; email: string },
  ) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      throw new BadRequestException('Invalid email format');
    }

    const user = await this.usersService.update(req.user.userId, {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      name: `${body.firstName} ${body.lastName}`, // Also set name for compatibility
    });

    return {
      success: true,
      data: {
        id: (user as any)._id?.toString(),
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        balance: user.balance ?? 0,
      },
    };
  }
}
