import { jwtDecode } from 'jwt-decode';
import { prisma } from '@/lib/client';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Define a proper TypeScript interface for the JWT payload
interface TokenPayload {
  id: string;
  role: string;
  phoneNumber?: string;
  exp?: number;
  iat?: number;
}

// ✅ Utility: Generate a JWT token - Keep this for server-side use only
export function generateToken(user: { id: string; role: string; phoneNumber?: string }) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      phoneNumber: user.phoneNumber,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ✅ Utility: Verify a JWT token - Updated for Edge Runtime compatibility
export function verifyToken(token: string): TokenPayload {
  try {
    if (!token || token.trim() === '') {
      throw new Error('Empty token provided');
    }

    // Use jwt-decode instead of jwt.verify for Edge Runtime compatibility
    const decoded = jwtDecode<TokenPayload>(token);

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      throw new Error('Token expired');
    }

    return decoded;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Token verification failed:', error.message);
    } else {
      console.error('Token verification failed:', error);
    }
    throw new Error('Invalid token');
  }
}

// ✅ Utility: Check if the user is admin based on token in request
export function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    console.log('No token provided for admin check');
    return false;
  }

  try {
    const decoded = jwtDecode<TokenPayload>(token);

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.log('Token expired for admin check');
      return false;
    }

    // Case-insensitive check for admin role
    return decoded.role?.toUpperCase() === 'ADMIN';
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in isAdmin check:', error.message);
    } else {
      console.error('Error in isAdmin check:', error);
    }
    return false;
  }
}

// ✅ Utility: Get full user from token
export async function getUserFromToken(token: string) {
  try {
    const payload = jwtDecode<TokenPayload>(token);

    // Verify token hasn't expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    // Get user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}
