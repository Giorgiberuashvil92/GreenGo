import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

const VERIFICATION_TTL_MS = 10 * 60 * 1000;
const SENDER_SEND_URL = 'https://sender.ge/api/send.php';

/**
 * Dev / სატესტო ნომერი (9 ციფრი, პრეფიქსის გარეშე): აპში +995555100000
 * SMS არ იგზავნება; ვერიფიკაციაში ყოველთვის კოდი: 1234
 * სხვა ნომერი: .env → DEV_BYPASS_PHONE_9=5XXXXXXXX (9 ციფრი)
 */
const DEFAULT_DEV_BYPASS_NINE = '555100000';

@Injectable()
export class AuthService {
  private readonly verificationCodes = new Map<
    string,
    { code: string; expiresAt: number }
  >();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(
    phoneNumber: string,
    password?: string,
  ): Promise<UserDocument | null> {
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
    const loginResult = {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        phoneNumber: user.phoneNumber,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
      },
    };
    console.log('🔐 Login result:', JSON.stringify(loginResult, null, 2));
    console.log('👤 User object from DB:', JSON.stringify(user, null, 2));
    return loginResult;
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /** 9 ციფრი ქართული მობილურის ნომერი (+995 / 995 პრეფიქსის გარეშე) */
  private normalizeGeorgianDestination(phoneNumber: string): string {
    const digits = phoneNumber.replace(/\D/g, '');
    let rest = digits;
    if (rest.startsWith('995') && rest.length >= 12) {
      rest = rest.slice(3);
    }
    if (rest.length !== 9 || !/^5\d{8}$/.test(rest)) {
      throw new BadRequestException('Invalid Georgian mobile number');
    }
    return rest;
  }

  /** იგივე გასაღები send/verify-ში, რომ ფორმატის სხვაობამ არ დააბნიოს */
  private verificationStorageKey(phoneNumber: string): string {
    return this.normalizeGeorgianDestination(phoneNumber);
  }

  /** ერთი ფიქსირებული ნომერი OTP/SMS-ის გარეშე — კოდი მხოლოდ 1234 */
  private getDevBypassNine(): string {
    const raw =
      this.configService.get<string>('DEV_BYPASS_PHONE_9')?.trim() ||
      process.env.DEV_BYPASS_PHONE_9?.trim() ||
      '';
    let nine = raw.replace(/\D/g, '');
    if (nine.startsWith('995') && nine.length >= 12) {
      nine = nine.slice(3);
    }
    if (nine.length === 9 && /^5\d{8}$/.test(nine)) {
      return nine;
    }
    return DEFAULT_DEV_BYPASS_NINE;
  }

  private senderApiKey(): string | undefined {
    return (
      this.configService.get<string>('SENDER_API_KEY')?.trim() ||
      process.env.SENDER_API_KEY?.trim()
    );
  }

  private async sendViaSender(
    destination9: string,
    content: string,
  ): Promise<void> {
    const apiKey = this.senderApiKey();
    if (!apiKey) {
      throw new InternalServerErrorException(
        'SENDER_API_KEY is not configured',
      );
    }
    const smsno =
      this.configService.get<string>('SENDER_SMS_NO')?.trim() || '2';
    const body = new URLSearchParams({
      apikey: apiKey,
      smsno,
      destination: destination9,
      content,
    });
    const res = await fetch(SENDER_SEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error('Sender.ge API error:', res.status, text);
      throw new InternalServerErrorException('Failed to send SMS');
    }
    if (text) {
      console.log('Sender.ge response:', text.slice(0, 160));
    }
  }

  async sendVerificationCode(
    phoneNumber: string,
  ): Promise<{ code?: string; sentViaSms: boolean }> {
    const destination = this.normalizeGeorgianDestination(phoneNumber);
    const storageKey = this.verificationStorageKey(phoneNumber);
    const bypassNine = this.getDevBypassNine();

    if (destination === bypassNine) {
      this.verificationCodes.set(storageKey, {
        code: '1234',
        expiresAt: Date.now() + VERIFICATION_TTL_MS,
      });
      console.log(
        `DEV bypass ნომერი +995${bypassNine} — SMS არაა; ვერიფიკაციის კოდი: 1234`,
      );
      return { sentViaSms: false };
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const apiKey = this.senderApiKey();

    this.verificationCodes.set(storageKey, {
      code,
      expiresAt: Date.now() + VERIFICATION_TTL_MS,
    });

    if (apiKey) {
      const message = `GreenGo: თქვენი კოდია ${code}`;
      await this.sendViaSender(destination, message);
      console.log(`Verification SMS sent to ${destination}`);
      return { sentViaSms: true };
    }

    console.log(
      `Verification code for ${storageKey}: ${code} (no SENDER_API_KEY — dev)`,
    );
    return { code, sentViaSms: false };
  }

  async verifyCodeOnly(phoneNumber: string, code: string): Promise<boolean> {
    if (!code || code.length !== 4 || !/^\d{4}$/.test(code)) {
      throw new UnauthorizedException('Invalid verification code format');
    }

    const storageKey = this.verificationStorageKey(phoneNumber);
    const entry = this.verificationCodes.get(storageKey);
    if (!entry || Date.now() > entry.expiresAt) {
      this.verificationCodes.delete(storageKey);
      throw new UnauthorizedException('Verification code expired or not found');
    }
    if (entry.code !== code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    this.verificationCodes.delete(storageKey);
    return true;
  }

  async verifyCode(phoneNumber: string, code: string): Promise<any> {
    // Verify code first
    await this.verifyCodeOnly(phoneNumber, code);

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
    const verifyCodeResult = {
      ...loginResult,
      isNewUser, // Flag to indicate if user needs to complete registration
    };
    console.log(
      '✅ VerifyCode result:',
      JSON.stringify(verifyCodeResult, null, 2),
    );
    return verifyCodeResult;
  }
}
