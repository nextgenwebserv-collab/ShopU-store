import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Static OTP logic
    return NextResponse.json(
      { success: true, message: 'OTP sent successfully', otp: '111111' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Something went wrong:', error);
    return NextResponse.json({ success: false, message: 'Internal Error' }, { status: 500 });
  }
}
