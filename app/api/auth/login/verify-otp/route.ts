import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/client';
import { generateToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json();

    // Static OTP verification logic
    if (otp !== '111111') {
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 401 });
    }

    let user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: uuidv4(),
          phoneNumber,
          role: 'user',
        },
      });
    }

    const token = generateToken({
      id: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });

    const response = NextResponse.json(
      { success: true, message: 'OTP verified successfully', token },
      { status: 201 }
    );
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: true,
      maxAge: 30 * 24 * 24 * 60 * 1000,
    });

    return response;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ success: false, message: 'Internal Error' }, { status: 500 });
  }
}
