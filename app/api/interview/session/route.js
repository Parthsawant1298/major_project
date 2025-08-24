// app/api/interview/session/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/middleware/auth';

// In-memory session store (in production, use Redis or database)
const activeSessions = new Map();

export async function POST(request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { jobId, assistantId, action } = await request.json();

    await connectDB();

    const sessionKey = `${jobId}_${user._id}`;

    if (action === 'start') {
      // Store session info
      activeSessions.set(sessionKey, {
        jobId,
        userId: user._id.toString(),
        assistantId,
        startTime: new Date(),
        status: 'active'
      });

      console.log('Interview session started:', sessionKey);

      return NextResponse.json({
        success: true,
        sessionId: sessionKey,
        message: 'Session started'
      });
    } else if (action === 'end') {
      // Mark session as ended
      const session = activeSessions.get(sessionKey);
      if (session) {
        session.status = 'ended';
        session.endTime = new Date();
      }

      console.log('Interview session ended:', sessionKey);

      return NextResponse.json({
        success: true,
        message: 'Session ended'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Interview session error:', error);
    return NextResponse.json(
      { error: 'Failed to manage session' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const assistantId = url.searchParams.get('assistantId');

    if (!assistantId) {
      return NextResponse.json({ error: 'Assistant ID required' }, { status: 400 });
    }

    // Find session by assistantId
    let foundSession = null;
    for (const [sessionKey, session] of activeSessions.entries()) {
      if (session.assistantId === assistantId && session.status === 'active') {
        foundSession = session;
        break;
      }
    }

    if (!foundSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      session: foundSession
    });

  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}