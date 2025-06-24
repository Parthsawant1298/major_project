import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireHostAuth } from '@/middleware/host-auth';
import { Job } from '@/models/job';

export async function GET(request) {
  try {
    const authResult = await requireHostAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { host } = authResult;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');

    await connectDB();

    // Build query
    const query = { hostId: host._id };
    if (status) {
      query.status = status;
    }

    // Get jobs with pagination
    const jobs = await Job.find(query)
      .select('-interviewQuestions') // Exclude questions for list view
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('shortlistedCandidates finalSelectedCandidates', 'userId atsScore finalScore status');

    const totalJobs = await Job.countDocuments(query);

    return NextResponse.json({
      success: true,
      jobs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalJobs / limit),
        totalJobs,
        hasNext: page < Math.ceil(totalJobs / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('List jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
