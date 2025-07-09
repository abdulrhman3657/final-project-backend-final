import { SignOptions } from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('Missing JWT_SECRET');
}

export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  accessToken: {
    options: {
      expiresIn: '7d', // 15m
      algorithm: 'HS256',
    } as SignOptions,
  },
  refreshToken: {
    options: {
      expiresIn: '7d',
      algorithm: 'HS256',
    } as SignOptions,
  },
}; 