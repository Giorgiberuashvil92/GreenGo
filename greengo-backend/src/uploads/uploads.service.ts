import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { createHash } from 'crypto';

type CloudinaryResponse = {
  secure_url?: string;
  url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  error?: {
    message?: string;
  };
};

@Injectable()
export class UploadsService {
  private getConfig() {
    const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
    if (cloudinaryUrl) {
      try {
        const parsed = new URL(cloudinaryUrl);
        const apiKey = decodeURIComponent(parsed.username);
        const apiSecret = decodeURIComponent(parsed.password);
        const cloudName = parsed.hostname;

        if (parsed.protocol === 'cloudinary:' && cloudName && apiKey && apiSecret) {
          return { cloudName, apiKey, apiSecret };
        }
      } catch {
        throw new InternalServerErrorException(
          'CLOUDINARY_URL არასწორი ფორმატითაა მითითებული',
        );
      }
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException(
        'Cloudinary env აკლია backend-ში',
      );
    }

    return { cloudName, apiKey, apiSecret };
  }

  private sign(params: Record<string, string | number>, apiSecret: string) {
    const payload = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return createHash('sha1')
      .update(`${payload}${apiSecret}`)
      .digest('hex');
  }

  async uploadImage(file: any, folder?: string) {
    if (!file) {
      throw new BadRequestException('სურათის ფაილი სავალდებულოა');
    }

    if (!String(file.mimetype || '').startsWith('image/')) {
      throw new BadRequestException('აირჩიეთ სურათის ფაილი');
    }

    const { cloudName, apiKey, apiSecret } = this.getConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const uploadFolder = folder?.trim() || 'greengo/admin';
    const signature = this.sign({ folder: uploadFolder, timestamp }, apiSecret);

    const formData = new FormData();
    formData.append('file', new Blob([file.buffer], { type: file.mimetype }));
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
    formData.append('folder', uploadFolder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const data = (await response.json().catch(() => ({}))) as CloudinaryResponse;

    if (!response.ok) {
      throw new BadRequestException(
        data.error?.message || `Cloudinary upload failed (${response.status})`,
      );
    }

    const url = data.secure_url || data.url;
    if (!url) {
      throw new BadRequestException('Cloudinary-მ სურათის URL არ დააბრუნა');
    }

    return {
      url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes,
    };
  }
}
