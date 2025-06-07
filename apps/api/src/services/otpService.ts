import sgMail from '@sendgrid/mail';
import speakeasy from 'speakeasy';
import { prisma } from '../db';
import type { OTPType } from '@prisma/client';

// SendGrid configuration
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// OTP configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

export const generateOTP = (): string => {
  return speakeasy.totp({
    secret: speakeasy.generateSecret().base32,
    digits: OTP_LENGTH,
  });
};

export const getOTPExpiry = (): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + OTP_EXPIRY_MINUTES);
  return expiry;
};

export const sendOTPEmail = async (email: string, otp: string, type: OTPType): Promise<void> => {
  const subject = type === 'REGISTRATION'
    ? 'Verify Your Email Address'
    : 'Password Reset OTP';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${subject}</h2>
      <p>Your OTP is: <strong style="font-size: 24px; color: #007bff;">${otp}</strong></p>
      <p>This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
      <p>If you didn't request this OTP, please ignore this email.</p>
    </div>
  `;

  try {
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};

export const verifyOTP = async (
  email: string,
  otp: string,
  type: OTPType
): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.otp || !user.otpExpiresAt || !user.otpType) {
    throw new Error('No OTP found for this user');
  }

  if (user.otpType !== type) {
    throw new Error(`Invalid OTP type. Expected ${type}`);
  }

  if (new Date() > user.otpExpiresAt) {
    throw new Error('OTP has expired');
  }

  return user.otp === otp;
};

export const clearOTP = async (email: string): Promise<void> => {
  await prisma.user.update({
    where: { email },
    data: {
      otp: null,
      otpExpiresAt: null,
      otpType: null,
    },
  });
}; 