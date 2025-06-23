// app/api/auth/user/route.js
import { NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';

export async function GET(request) {
  try {
    const authResult = await requireAuth(request);
    
    // If authResult is a NextResponse (error), return it
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        branch: user.branch,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch user data.' },
    { status: 405 }
  );
}