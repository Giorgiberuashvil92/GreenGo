import { BadRequestException, Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
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
  async sendVerificationCode(@Body() body: { phoneNumber: string; countryCode?: string }) {
    const { code } = await this.authService.sendVerificationCode(body.phoneNumber);
    return {
      success: true,
      message: 'Verification code sent',
      // In development, return code for testing (remove in production!)
      code, // Remove this in production
    };
  }

  @Post('verify-code')
  async verifyCode(@Body() body: { phoneNumber: string; verificationCode: string }) {
    const result = await this.authService.verifyCode(
      body.phoneNumber,
      body.verificationCode,
    );
    return {
      success: true,
      ...result,
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
      },
    };
  }
}

