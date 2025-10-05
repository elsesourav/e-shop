import { AuthError, NotFoundError } from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies.access_token || req.cookies.access_token_seller || req.headers.authorization?.split(' ')[1];

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

    // const user = await prisma.users.findUnique({ where: { id: decoded.id } });
    // if (!user) {
    //   throw new NotFoundError('User not found.');
    // }

    let account;

    if (decoded.role === 'user') {
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
      if (!account) {
        throw new NotFoundError('User not found.');
      }
      req.user = account;
    } else if (decoded.role === 'seller') {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
      if (!account) {
        throw new NotFoundError('Seller not found.');
      }
      req.seller = account;
    } else {
      throw new AuthError('Unauthorized! Invalid role.');
    }

    req.role = decoded.role;

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
