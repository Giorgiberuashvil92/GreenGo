import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(phoneNumber: string, password?: string): Promise<UserDocument | null> {
    const user = await this.usersService.findByPhone(phoneNumber);
    if (user) {
      // For phone-based auth, we don't need password
      // In future, can add password verification here
      return user;
    }
    return null;
  }

  async login(user: UserDocument | any) {
    const userId = (user as any)._id?.toString() || (user as any).id;
    const payload = {
      phoneNumber: user.phoneNumber,
      sub: userId,
      id: userId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
      },
    };
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async sendVerificationCode(phoneNumber: string): Promise<{ code: string }> {
    // TODO: Integrate with SMS service (Twilio, etc.)
    // For now, generate a simple code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    // In production, send SMS here
    console.log(`Verification code for ${phoneNumber}: ${code}`);
    
    // Store code in memory/database with expiration
    // For now, just return it (not secure for production!)
    return { code };
  }

  async verifyCode(phoneNumber: string, code: string): Promise<any> {
    // TODO: Verify code from database/cache
    // For now, accept any 4-digit code (NOT SECURE!)
    
    let user = await this.usersService.findByPhone(phoneNumber);
    let isNewUser = false;
    
    if (!user) {
      // Create new user (without name - will be filled in registration)
      isNewUser = true;
      user = await this.usersService.create({
        phoneNumber,
        isVerified: true,
        preferences: {
          language: 'ka',
          notifications: true,
        },
      });
    } else {
      // Update verification status
      const userId = (user as any)._id?.toString();
      if (userId) {
        user = await this.usersService.update(userId, {
          isVerified: true,
        });
      }
    }

    const loginResult = await this.login(user as any);
    return {
      ...loginResult,
      isNewUser, // Flag to indicate if user needs to complete registration
    };
  }
}
