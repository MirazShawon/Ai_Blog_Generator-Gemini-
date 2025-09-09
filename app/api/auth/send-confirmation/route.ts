// app/api/auth/send-confirmation/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if RESEND_API_KEY is configured and not a mock key
    if (!process.env.RESEND_API_KEY || 
        process.env.RESEND_API_KEY === 'your-resend-api-key-here' ||
        process.env.RESEND_API_KEY.includes('dev') ||
        process.env.RESEND_API_KEY.includes('mock')) {
      console.log(`Mock email sent to ${email}: Welcome ${name}! This is a development environment.`);
      return NextResponse.json({ 
        success: true, 
        message: 'Welcome email sent successfully (mock mode)',
        data: { id: 'mock-email-id', from: 'onboarding@resend.dev', to: email }
      });
    }

    // Only import and use Resend if we have a real API key
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY || 're_default_key_for_build');

    // Check if we have a real API key before sending email
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_default_key_for_build') {
      return NextResponse.json({ 
        success: true, 
        message: 'Email sending is not configured in this environment',
        data: { id: 'mock-email-id', from: 'onboarding@resend.dev', to: email }
      });
    }

    // Send actual email using Resend
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Welcome to BlogAI!',
      text: `Hello ${name},\n\nThank you for joining BlogAI! We're excited to have you on board.\n\nWith BlogAI, you can create engaging blog posts with AI assistance, manage your writing projects in one place, and get inspiration when you need it.\n\nReady to start your writing journey? Log in to your account now.\n\nIf you have any questions or need assistance, feel free to reach out to our support team.\n\nHappy writing!\nThe BlogAI Team`,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome email sent successfully',
      data 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}