// app/api/jobs/[jobId]/shortlist/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireHostAuth } from '@/middleware/host-auth';
import { Job, Application } from '@/models/job';

export async function GET(request, { params }) {
  try {
    // This route should be accessible to hosts only
    const authResult = await requireHostAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { host } = authResult;
    const { jobId } = await params;

    await connectDB();

    // Verify job ownership
    const job = await Job.findOne({ _id: jobId, hostId: host._id });
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or access denied' },
        { status: 404 }
      );
    }

    // Get shortlisted applications with populated user data
    const applications = await Application.find({ 
      jobId: jobId,
      status: { $in: ['shortlisted', 'interview_completed', 'selected', 'rejected'] }
    })
    .populate('userId', 'name email phone profilePicture')
    .sort({ finalScore: -1 });

    // Format response with candidate data
    const candidates = applications.map(app => ({
      id: app._id,
      user: {
        id: app.userId._id,
        name: app.userId.name,
        email: app.userId.email,
        phone: app.userId.phone,
        profilePicture: app.userId.profilePicture
      },
      atsScore: app.atsScore || 0,
      finalScore: app.finalScore || 0,
      ranking: app.ranking || 0,
      status: app.status,
      voiceInterviewCompleted: app.voiceInterviewCompleted || false,
      voiceInterviewScore: app.voiceInterviewScore || 0,
      appliedAt: app.createdAt,
      resumeUrl: app.resumeUrl,
      aiAnalysis: app.aiAnalysis || {
        skillsMatch: 0,
        experienceMatch: 0,
        overallFit: 0,
        strengths: [],
        weaknesses: [],
        recommendations: []
      },
      voiceInterviewFeedback: app.voiceInterviewFeedback || null
    }));

    return NextResponse.json({
      success: true,
      job: {
        id: job._id,
        jobTitle: job.jobTitle,
        maxCandidatesShortlist: job.maxCandidatesShortlist,
        finalSelectionCount: job.finalSelectionCount,
        status: job.status,
        currentApplications: job.currentApplications,
        targetApplications: job.targetApplications
      },
      candidates
    });

  } catch (error) {
    console.error('Get shortlist error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shortlisted candidates' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch shortlisted candidates.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch shortlisted candidates.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to fetch shortlisted candidates.' },
    { status: 405 }
  );
}