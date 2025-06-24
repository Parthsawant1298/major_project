// app/api/jobs/[jobId]/details/route.js
import { requireAuth } from '@/middleware/auth';
import { Application } from '@/models/job';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { jobId } = params;

    // Get job details with host information
    const job = await Job.findOne({ 
      _id: jobId,
      status: { $in: ['published', 'applications_open', 'applications_closed'] }
    })
    .select('-interviewQuestions -vapiAssistantId -shortlistedCandidates -finalSelectedCandidates')
    .populate('hostId', 'name organization profilePicture isVerified rating totalEvents');

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if user is authenticated and has applied
    let userApplication = null;
    const authHeader = request.headers.get('authorization');
    
    if (authHeader) {
      try {
        const authResult = await requireAuth(request);
        if (!(authResult instanceof NextResponse)) {
          const { user } = authResult;
          userApplication = await Application.findOne({
            jobId: jobId,
            userId: user._id
          }).select('status createdAt atsScore finalScore ranking');
        }
      } catch (error) {
        // User not authenticated, continue without application info
      }
    }

    // Increment view count
    await Job.findByIdAndUpdate(jobId, { $inc: { totalViews: 1 } });

    return NextResponse.json({
      success: true,
      job: {
        ...job.toObject(),
        applicationProgress: {
          current: job.currentApplications,
          target: job.targetApplications,
          percentage: Math.round((job.currentApplications / job.targetApplications) * 100),
          slotsRemaining: job.targetApplications - job.currentApplications,
          isFull: job.currentApplications >= job.targetApplications
        }
      },
      userApplication
    });

  } catch (error) {
    console.error('Get job details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job details' },
      { status: 500 }
    );
  }
}
