// app/api/host/jobs/[jobId]/questions/update/route.js
export async function PUT(request, { params }) {
  try {
    const authResult = await requireHostAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { host } = authResult;
    const { jobId } = params;
    const { questions } = await request.json();

    await connectDB();

    // Find job and verify ownership
    const job = await Job.findOne({ _id: jobId, hostId: host._id });
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Validate questions format
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'At least one question is required' },
        { status: 400 }
      );
    }

    // Update questions
    job.interviewQuestions = questions;
    await job.save();

    return NextResponse.json({
      success: true,
      message: 'Questions updated successfully'
    });

  } catch (error) {
    console.error('Update questions error:', error);
    return NextResponse.json(
      { error: 'Failed to update questions. Please try again.' },
      { status: 500 }
    );
  }
}
