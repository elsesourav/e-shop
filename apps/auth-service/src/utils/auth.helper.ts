import crypto from 'crypto';
import { ValidationError } from '@packages/error-handler';
import { Request, Response, NextFunction } from 'express';
import prisma from '@packages/libs/prisma';
import redis from '@packages/libs/redis';
import { sendEmail } from './send-mail';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format

export const validateRegistrationData = (
  data: any,
  userType: 'user' | 'seller'
) => {
  const { name, email, password, phone, country } = data;
  if (
    !name ||
    !email ||
    !password ||
    (userType === 'seller' && (!phone || !country))
  ) {
    throw new ValidationError('Missing required fields!');
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format!');
  }
};

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    throw new ValidationError(
      'Too many attempts! Please try again after 30 minutes.'
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    throw new ValidationError(
      'Too many OTP requests! Please try again after 1 hours.'
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    throw new ValidationError(
      'Please wait 1 minute before requesting another OTP.'
    );
  }
};

export const trackOtpRequest = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  const otpRequest = parseInt((await redis.get(otpRequestKey)) || '0');

  if (otpRequest >= 2) {
    await redis.set(`otp_spam_lock:${email}`, 'locked', {
      ex: 3600,
    }); // 1 hour lock
    throw new ValidationError(
      'Too many OTP requests! Please try again after 1 hours.'
    );
  }

  await redis.set(otpRequestKey, (otpRequest + 1).toString(), {
    ex: 3600,
  }); // Count resets after 1 hour
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, 'Verify Your Email', template, { name, otp });
  await redis.set(`otp:${email}`, otp, { ex: 300 }); // OTP valid for 5 minutes
  await redis.set(`otp_cooldown:${email}`, 'true', { ex: 60 }); // 1 minute cooldown
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const otpKey = `otp:${email}`;
  const storedOtp = (await redis.get(otpKey))?.toString();

  if (!storedOtp) {
    throw new ValidationError('Invalid or expired OTP!');
  }
  const failedAttemptsKey = `otp_failed_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || '0');

  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, 'locked', { ex: 1800 }); // 30 minutes lock
      await redis.del(otpKey, failedAttemptsKey);

      throw new ValidationError(
        'Too many failed attempts! Your account is locked for 30 minutes.'
      );
    }

    await redis.set(failedAttemptsKey, (failedAttempts + 1).toString(), {
      ex: 300,
    }); // Count resets after 5 minutes
    throw new ValidationError(
      `Incorrect OTP! ${2 - failedAttempts} attempts left.`
    );
  }

  await redis.del(otpKey, failedAttemptsKey);
};

export const handleVerifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return next(new ValidationError('Email and OTP are required!'));
    }
    await verifyOtp(email, otp, next);

    res
      .status(200)
      .json({ message: 'OTP verified. You can now reset your password.' });
  } catch (error) {
    return next(error);
  }
};

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: 'user' | 'seller'
) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new ValidationError('Email is required!'));
    }

    // Find user/seller by email in database
    const user =
      userType === 'user'
        ? await prisma.users.findUnique({ where: { email } })
        : await prisma.sellers.findUnique({ where: { email } });

    if (!user) {
      return next(
        new ValidationError(`No ${userType} found with this ${email} email!`)
      );
    }

    // Check OTP request restrictions
    await checkOtpRestrictions(email, next);
    await trackOtpRequest(email, next);

    // Generate and send OTP on email
    await sendOtp(
      user.name,
      email,
      userType === 'user'
        ? 'user-forgot-password-mail'
        : 'seller-forgot-password-mail'
    );

    res.status(200).json({
      message: `OTP sent to your email! Please verify your account to reset your password.`,
    });
  } catch (error) {
    return next(error);
  }
};
