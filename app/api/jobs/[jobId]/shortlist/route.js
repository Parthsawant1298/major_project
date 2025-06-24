// app/api/jobs/[jobId]/shortlist/route.js - For hosts to view shortlisted candidates
export async function GET(request, { params }) {
  try {
    const authResult = await requireHostAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { host } = authResult;
    const { jobId } = params;

    await connectDB();

    // Verify job ownership
    const job = await Job.findOne({ _id: jobId, hostId: host._id });
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get shortlisted applications
    const applications = await Application.find({ 
      jobId: jobId,
      status: { $in: ['shortlisted', 'interview_completed', 'selected'] }
    })
    .populate('userId', 'name email phone profilePicture')
    .sort({ finalScore: -1 });

    // Format response
    const candidates = applications.map(app => ({
      id: app._id,
      user: app.userId,
      atsScore: app.atsScore,
      finalScore: app.finalScore,
      ranking: app.ranking,
      status: app.status,
      voiceInterviewCompleted: app.voiceInterviewCompleted,
      voiceInterviewScore: app.voiceInterviewScore,
      appliedAt: app.createdAt,
      resumeUrl: app.resumeUrl,
      aiAnalysis: app.aiAnalysis,
      voiceInterviewFeedback: app.voiceInterviewFeedback
    }));

    return NextResponse.json({
      success: true,
      job: {
        id: job._id,
        jobTitle: job.jobTitle,
        maxCandidatesShortlist: job.maxCandidatesShortlist,
        finalSelectionCount: job.finalSelectionCount,
        status: job.status
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