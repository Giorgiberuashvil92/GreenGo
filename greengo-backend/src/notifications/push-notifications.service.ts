import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';

export type FcmPushMessage = {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

@Injectable()
export class PushNotificationsService implements OnModuleInit {
  private readonly logger = new Logger(PushNotificationsService.name);
  private messaging: Messaging | null = null;
  private ready = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.initFirebase();
  }

  isReady(): boolean {
    return this.ready && this.messaging != null;
  }

  private initFirebase() {
    try {
      if (getApps().length > 0) {
        this.messaging = getMessaging();
        this.ready = true;
        this.logger.log('Firebase Admin უკვე ინიციალიზებულია');
        return;
      }

      const jsonInline =
        this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON') ||
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      const jsonBase64 =
        this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON_BASE64') ||
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
      const jsonPath =
        this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH') ||
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

      let serviceAccount: Record<string, unknown> | null = null;

      if (jsonInline?.trim()) {
        serviceAccount = JSON.parse(jsonInline) as Record<string, unknown>;
      } else if (jsonBase64?.trim()) {
        serviceAccount = JSON.parse(
          Buffer.from(jsonBase64.trim(), 'base64').toString('utf8'),
        ) as Record<string, unknown>;
      } else if (jsonPath?.trim() && existsSync(jsonPath)) {
        serviceAccount = JSON.parse(
          readFileSync(jsonPath, 'utf8'),
        ) as Record<string, unknown>;
      }

      if (!serviceAccount) {
        this.logger.warn(
          'Firebase არ არის კონფიგურირებული (FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 ან FIREBASE_SERVICE_ACCOUNT_PATH). Push გათიშულია.',
        );
        return;
      }

      const app: App = initializeApp({
        credential: cert(serviceAccount as any),
      });
      this.messaging = getMessaging(app);
      this.ready = true;
      this.logger.log('Firebase Admin ინიციალიზებულია — FCM მზადაა');
    } catch (error: any) {
      this.logger.error(
        `Firebase ინიციალიზაციის შეცდომა: ${error?.message || error}`,
      );
      this.ready = false;
      this.messaging = null;
    }
  }

  /**
   * აგზავნის FCM push-ებს. აბრუნებს არავალიდურ ტოკენებს (უნდა წაიშალოს DB-დან).
   */
  async send(
    messages: FcmPushMessage[],
  ): Promise<{
    successCount: number;
    failureCount: number;
    invalidTokens: string[];
  }> {
    if (!this.messaging || !this.ready) {
      this.logger.warn('FCM არ არის მზად — push გამოტოვებულია');
      return {
        successCount: 0,
        failureCount: messages.length,
        invalidTokens: [],
      };
    }

    if (messages.length === 0) {
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    const invalidTokens: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    const chunkSize = 500;
    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);
      try {
        const response = await this.messaging.sendEach(
          chunk.map((msg) => ({
            token: msg.token,
            notification: {
              title: msg.title,
              body: msg.body,
            },
            data: msg.data,
            android: {
              priority: 'high' as const,
              notification: {
                channelId: 'orders',
                sound: 'default',
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: 'default',
                  badge: 1,
                },
              },
            },
          })),
        );

        successCount += response.successCount;
        failureCount += response.failureCount;

        response.responses.forEach((res, index) => {
          if (res.success) return;
          const code = res.error?.code || '';
          this.logger.warn(
            `FCM error …${chunk[index].token.slice(-8)}: ${code} ${res.error?.message}`,
          );
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/invalid-argument'
          ) {
            invalidTokens.push(chunk[index].token);
          }
        });
      } catch (error: any) {
        failureCount += chunk.length;
        this.logger.error(`FCM sendEach error: ${error?.message || error}`);
      }
    }

    return { successCount, failureCount, invalidTokens };
  }
}
