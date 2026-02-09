// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const { name, subject, message } = await req.json();

  if (!name || !subject || !message) {
    return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER, // your Gmail address
      pass: process.env.SMTP_PASS, // your Gmail App Password (not your real password)
    },
  });

  try {
    await transporter.sendMail({
      from: `"Shop U Store Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_RECEIVER, // who gets the message
      subject: subject,
      html: `
        <h2>New Message from ${name}</h2>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Email failed' }, { status: 500 });
  }
}
