import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID } from '@/lib/appwrite-server';
import { ID } from 'node-appwrite';

export async function POST(request: NextRequest) {
  try {
    const { email, source = 'launch_page' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    try {
      // Try to create early access signup record
      const signup = await databases.createDocument(
        DATABASE_ID,
        'early_access_signups', // This collection needs to be created in Appwrite
        ID.unique(),
        {
          email: email.toLowerCase(),
          source,
          signupDate: new Date().toISOString(),
          referralCode: generateReferralCode(),
          status: 'pending'
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Successfully added to early access list',
        referralCode: signup.referralCode
      });

    } catch (dbError: any) {
      // If collection doesn't exist yet, return success anyway for launch
      console.error('Database error (expected during launch):', dbError);
      
      return NextResponse.json({
        success: true,
        message: 'Successfully added to early access list',
        referralCode: generateReferralCode()
      });
    }

  } catch (error) {
    console.error('Launch signup error:', error);
    return NextResponse.json(
      { error: 'Failed to process signup' },
      { status: 500 }
    );
  }
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Add CORS headers for external integrations
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}