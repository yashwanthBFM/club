import crypto from 'crypto';

export const OTP_EXPIRY_MINUTES = 10;

/**
 * Generates a random 6-digit OTP.
 * @returns A 6-digit numeric string.
 */
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Calculates the expiry time for an OTP.
 * @param minutes - Number of minutes until expiry (defaults to OTP_EXPIRY_MINUTES).
 * @returns A Date object representing the expiry time.
 */
export const getOTPExpiry = (minutes: number = OTP_EXPIRY_MINUTES): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
}; 