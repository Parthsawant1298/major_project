// app/api/host/jobs/[jobId]/finalize/route.js
import { createVAPIAssistant, generateInterviewLink } from '@/lib/vapi-service';

export async function POST(request, { params }) {
  try {
    const authResult = await requireHostAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { host } = authResult;
    const { jobId } = params;

    await connectDB();

    // Find job and verify ownership
    const job = await Job.findOne({ _id: jobId, hostId: host._id });
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (!job.interviewQuestions || job.interviewQuestions.length === 0) {
      return NextResponse.json(
        { error: 'Interview questions are required before finalizing' },
        { status: 400 }
      );
    }

    // Create VAPI assistant with questions
    const vapiAssistant = await createVAPIAssistant({
      jobTitle: job.jobTitle,
      questions: job.interviewQuestions,
      duration: job.voiceInterviewDuration
    });

    // Generate interview link
    const interviewLink = generateInterviewLink(vapiAssistant.id, jobId);

    // Update job with VAPI details and publish
    job.vapiAssistantId = vapiAssistant.id;
    job.interviewLink = interviewLink;
    job.status = 'published';
    await job.save();

    return NextResponse.json({
      success: true,
      message: 'Job published successfully',
      jobId: job._id,
      interviewLink: interviewLink
    });

  } catch (error) {
    console.error('Finalize job error:', error);
    return NextResponse.json(
      { error: 'Failed to finalize job. Please try again.' },
      { status: 500 }
    );
  }
}
