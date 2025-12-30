import { AuthError, ValidationError } from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import Stripe from 'stripe';
import {
  checkOtpRestrictions,
  handleForgotPassword,
  handleVerifyForgotPasswordOtp,
  sendOtp,
  trackOtpRequest,
  validateRegistrationData,
  verifyOtp,
} from '../utils/auth.helper';
import { setCookie } from '../utils/cookies/setCookie';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! as string, {
  apiVersion: '2025-09-30.clover',
});

// Register a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, 'user');

    const { name, email } = req.body;
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return next(new ValidationError('User already exists with this email!'));
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequest(email, next);
    await sendOtp(name, email, 'user-activation-mail');

    res.status(200).json({
      message:
        'OTP sent to your email! Please verify to complete registration.',
    });
  } catch (error) {
    return next(error);
  }
};

// Verify user with OTP
export const userVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password || !name) {
      return next(new ValidationError('All fields are required!'));
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return next(new ValidationError('User already exists with this email!'));
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    console.log('User created successfully\nuser:', user);

    res.status(201).json({
      message: 'User registration successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Login user
export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError('Email and password are required!'));
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(new AuthError("User doesn't exist with this email!"));
    }

    const isMatched = await bcrypt.compare(password, user.password!);
    if (!isMatched) {
      return next(new AuthError('Invalid email or password!'));
    }

    res.clearCookie('refresh_token_seller');
    res.clearCookie('access_token_seller');

    const accessToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.JWT_ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.JWT_REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7d' }
    );

    // store refresh and access token in an httpOnly secure cookie
    setCookie(res, 'refresh_token', refreshToken);
    setCookie(res, 'access_token', accessToken);

    res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Get Logged in user
export const getLoggedInUser = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    res.status(201).json({ success: true, user });
  } catch (error) {
    return next(error);
  }
};

// User forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgotPassword(req, res, next, 'user');
};

// Verify OTP for password reset
export const userVerifyForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleVerifyForgotPasswordOtp(req, res, next);
};

// Reset user password
export const userResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return next(new ValidationError('Email and new password are required!'));
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(new ValidationError('No user found with this email!'));
    }

    // compare new password with old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword) {
      return next(
        new ValidationError(
          'New password must be different from the old password!'
        )
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: 'Password reset successful!' });
  } catch (error) {
    return next(error);
  }
};

// Register a new seller
export const sellerRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, 'seller');

    const { name, email } = req.body;

    // Check if seller already exists
    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      return next(
        new ValidationError('Seller with this email already exists!')
      );
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequest(email, next);
    await sendOtp(name, email, 'seller-activation-mail');

    res
      .status(200)
      .json({ message: 'OTP sent to email. please verify your account.' });
  } catch (error) {
    return next(error);
  }
};

// Verify seller with OTP
export const sellerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone, country } = req.body;

    if (!email || !otp || !password || !name || !phone || !country) {
      return next(new ValidationError('All fields are required!'));
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller) {
      return next(
        new ValidationError('Seller already exists with this email!')
      );
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        phone,
        country,
        password: hashedPassword,
      },
    });

    console.log('Seller created successfully\nseller:', seller);

    res.status(201).json({
      message: 'Seller registration successful!',
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        country: seller.country,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Creating a new shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      address,
      openingHours,
      website,
      category,
      sellerId,
    } = req.body;

    console.log(req.body);

    if (
      !name ||
      !description ||
      !address ||
      !openingHours ||
      !category ||
      !sellerId
    ) {
      return next(new ValidationError('All fields are required!'));
    }

    const shopData: any = {
      name,
      description,
      address,
      openingHours,
      category,
      sellerId,
    };

    if (website && website.trim() !== '') {
      shopData.website = website;
    }

    const newShop = await prisma.shops.create({
      data: shopData,
    });

    res.status(201).json({
      success: true,
      message: 'Shop created successfully!',
      shop: newShop,
    });
  } catch (error) {
    return next(error);
  }
};

// create stripe connect account for seller
export const createStripeConnectAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) {
      return next(new ValidationError('Seller ID is required!'));
    }

    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });

    if (!seller) {
      return next(new ValidationError('No seller found with this ID!'));
    }

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'GB',
      email: seller.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await prisma.sellers.update({
      where: { id: sellerId },
      data: { stripeId: account.id },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3000/success`,
      return_url: `http://localhost:3000/success`,
      type: 'account_onboarding',
    });

    res.status(201).json({ url: accountLink.url });
  } catch (error) {
    return next(error);
  }
};

// Login seller
export const sellerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError('Email and password are required!'));
    }

    const seller = await prisma.sellers.findUnique({ where: { email } });
    if (!seller) {
      return next(new AuthError("Seller doesn't exist with this email!"));
    }

    const isMatched = await bcrypt.compare(password, seller.password!);
    if (!isMatched) {
      return next(new AuthError('Invalid email or password!'));
    }

    res.clearCookie('refresh_token');
    res.clearCookie('access_token');

    const accessToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.JWT_ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15h' }
    );

    const refreshToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.JWT_REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7d' }
    );

    // store refresh and access token in an httpOnly secure cookie
    setCookie(res, 'refresh_token_seller', refreshToken);
    setCookie(res, 'access_token_seller', accessToken);

    res.status(200).json({
      message: 'Login successful!',
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// get Seller
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    res.status(201).json({ success: true, seller });
  } catch (error) {
    return next(error);
  }
};

// Logout User
export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully!',
    });
  } catch (error) {
    return next(error);
  }
};

// Logout Seller
export const logoutSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie('access_token_seller');
    res.clearCookie('refresh_token_seller');
    res.status(200).json({
      success: true,
      message: 'Logged out successfully!',
    });
  } catch (error) {
    return next(error);
  }
};

// Refresh Token
export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies.refresh_token || req.cookies.refresh_token_seller;
    if (!refreshToken) {
      return next(new ValidationError('Unauthorized! Please login again.'));
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };

    // Fixed: Should check if role doesn't exist, not if it exists
    if (!decoded || !decoded.id || !decoded.role) {
      return next(new JsonWebTokenError('Forbidden Invalid refresh token!'));
    }

    let account;
    if (decoded.role === 'user') {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else if (decoded.role === 'seller') {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          country: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else {
      return next(new AuthError('Forbidden Invalid role!'));
    }

    if (!account) {
      return next(new AuthError(`Forbidden ${decoded.role} not found!`));
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    const accessToken =
      decoded.role === 'user' ? 'access_token' : 'access_token_seller';

    setCookie(res, accessToken, newAccessToken);

    req.role = decoded.role;
    res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

// Add User Address
export const addUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { label, name, phone, address, city, zpi, country, isDefault } =
      req.body;

    if (!label || !name || !phone || !address || !city || !zpi || !country) {
      return next(new ValidationError('All fields are required!'));
    }

    if (isDefault) {
      await prisma.addresses.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.addresses.create({
      data: {
        userId,
        label,
        name,
        phone,
        address,
        city,
        zpi,
        country,
        isDefault,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully!',
      address: newAddress,
    });
  } catch (error) {
    return next(error);
  }
};

// Update User Address
export const updateUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;
    const { label, name, phone, address, city, zpi, country, isDefault } =
      req.body;

    if (!addressId) {
      return next(new ValidationError('Address ID is required!'));
    }

    const existingAddress = await prisma.addresses.findUnique({
      where: { id: addressId, userId },
    });

    if (!existingAddress || existingAddress.userId !== userId) {
      return next(new ValidationError('Address not found!'));
    }

    if (isDefault) {
      await prisma.addresses.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.addresses.update({
      where: { id: addressId },
      data: {
        label,
        name,
        phone,
        address,
        city,
        zpi,
        country,
        isDefault,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Address updated successfully!',
      address: updatedAddress,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete User Address
export const deleteUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    if (!addressId) {
      return next(new ValidationError('Address ID is required!'));
    }

    const address = await prisma.addresses.findUnique({
      where: { id: addressId, userId },
    });

    if (!address || address.userId !== userId) {
      return next(new ValidationError('Address not found!'));
    }

    await prisma.addresses.delete({
      where: { id: addressId },
    });

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully!',
    });
  } catch (error) {
    return next(error);
  }
};

// Get User Addresses
export const getUserAddresses = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const addresses = await prisma.addresses.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    return next(error);
  }
};
