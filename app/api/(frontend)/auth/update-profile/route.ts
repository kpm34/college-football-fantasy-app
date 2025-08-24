import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { name, email } = await request.json();
    
    // Create the Appwrite session cookie format
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    
    let updatedUser: any = {};
    
    // Update name if provided
    if (name !== undefined) {
      const nameResponse = await fetch('https://nyc.cloud.appwrite.io/v1/account/name', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': 'college-football-fantasy-app',
          'X-Appwrite-Response-Format': '1.4.0',
          'Cookie': cookieHeader,
        },
        body: JSON.stringify({ name }),
      });

      if (!nameResponse.ok) {
        const error = await nameResponse.json();
        return NextResponse.json(error, { status: nameResponse.status });
      }
      
      updatedUser = await nameResponse.json();
    }
    
    // Update email if provided
    if (email !== undefined) {
      const emailResponse = await fetch('https://nyc.cloud.appwrite.io/v1/account/email', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': 'college-football-fantasy-app',
          'X-Appwrite-Response-Format': '1.4.0',
          'Cookie': cookieHeader,
        },
        body: JSON.stringify({ 
          email: email,
          password: '' // Password is required but we'll need to handle this differently
        }),
      });

      if (!emailResponse.ok) {
        const error = await emailResponse.json();
        // If email update fails, we might need the user to confirm with password
        if (error.type === 'user_password_required' || error.code === 401) {
          return NextResponse.json(
            { error: 'Password required to update email', requiresPassword: true },
            { status: 400 }
          );
        }
        return NextResponse.json(error, { status: emailResponse.status });
      }
      
      updatedUser = await emailResponse.json();
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
