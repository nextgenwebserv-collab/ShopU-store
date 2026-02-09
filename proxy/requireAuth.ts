import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function requireAuth(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return {
      authenticated: false,
      response: NextResponse.json({ success: false, error: 'Please login first' }, { status: 401 }),
    };
  }

  try {
    const user = verifyToken(token);

    if (!user || !user.id) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        ),
      };
    }

    return {
      authenticated: true,
      user,
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      ),
    };
  }
}
