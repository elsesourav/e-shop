import { AuthError, NotFoundError } from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies.access_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AuthError('Unauthorized! Token missing.');
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET as string
    ) as { id: string; role: 'user' | 'seller' };

    if (!decoded || !decoded.id || !decoded.role) {
      throw new AuthError('Unauthorized! Invalid token.');
    }

    const user = await prisma.users.findUnique({ where: { id: decoded.id } });
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof AuthError || error instanceof NotFoundError) {
      return next(error);
    }
    // JWT verification errors
    return next(new AuthError('Unauthorized! Token expired or invalid.'));
  }
};

export default isAuthenticated;
