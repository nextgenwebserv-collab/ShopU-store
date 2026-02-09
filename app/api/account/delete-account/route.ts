import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { verifyToken } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    const userIdToDelete = payload.id;

    // Delete the user directly on cascade so all related data is also deleted
    await prisma.user.delete({
      where: { id: userIdToDelete },
    });

    // Clear the token cookie
    const response = NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
    response.cookies.set('token', '', { path: '/', maxAge: 0 });

    return response;
  } catch (error) {
    console.error('[DELETE /api/account/delete]', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
