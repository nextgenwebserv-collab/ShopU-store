import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    const twilioResponse = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_ID!)
      .verifications.create({
        to: `+91${phoneNumber}`,
        channel: 'sms',
      });

    if (twilioResponse && ['pending', 'send'].includes(twilioResponse.status)) {
      return NextResponse.json(
        { success: true, message: 'OTP send successfully' },
        { status: 201 }
      );
    } else {
      return NextResponse.json({ success: false, message: 'OTP send Failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('Somthing wents wrong:', error);
    return NextResponse.json({ success: false, message: 'Internal Error' }, { status: 500 });
  }
}
