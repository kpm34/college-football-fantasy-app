import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../core/services/auth.service';
import { withErrorHandler } from '../../../../core/utils/error-handler';
import { ForbiddenError } from '../../../../core/errors/app-error';

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Check if signups are disabled
  if (process.env.NEXT_PUBLIC_DISABLE_SIGNUPS === 'true') {
    throw new ForbiddenError('Signups are currently disabled');
  }

  const { email, password, name } = await request.json();
  
  // Create auth service instance
  const authService = new AuthService();
  
  // Register new user (auto-login handled by service)
  const user = await authService.register(email, password, name);
  
  // Return user data
  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: user.$id,
        email: user.email,
        name: user.name,
      },
      message: 'Account created successfully'
    }
  });
});
