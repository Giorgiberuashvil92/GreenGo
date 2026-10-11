/** App Store / Play Store review — SMS-ის გარეშე შესვლა */
export const REVIEW_PHONE = '+995557422635';
export const REVIEW_OTP = '1234';
export const REVIEW_COURIER_ID = '6a193df3d32a4dad32243b75';

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s-]/g, '');
}

export function isReviewPhone(phone: string): boolean {
  return normalizePhone(phone) === REVIEW_PHONE;
}

export function isReviewOtp(code: string): boolean {
  return code === REVIEW_OTP;
}
