// app/api/host/jobs/[jobId]/finalize/route.js - CORRECTED VERSION
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireHostAuth } from '@/middleware/host-auth';
import { Job } from '@/models/job';
import { createVAPIAssistant, generateInterviewLink } from '@/lib/vapi-service';

export async function POST(request, { params }) {
  try {
    const authResult = await requireHostAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { host } = authResult;
    const { jobId } = await params;

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

    console.log('Creating VAPI assistant for job:', jobId);

    // Create VAPI assistant with questions
    const vapiAssistant = await createVAPIAssistant({
      jobTitle: job.jobTitle,
      questions: job.interviewQuestions,
      duration: job.voiceInterviewDuration
    });

    console.log('VAPI assistant created:', vapiAssistant.id);

    // FIXED: Generate interview link with proper URL
    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const interviewLink = `${baseUrl}/interview/${jobId}?assistant=${vapiAssistant.id}`;

    console.log('Generated interview link:', interviewLink);

    // Update job with VAPI details and publish
    job.vapiAssistantId = vapiAssistant.id;
    job.interviewLink = interviewLink;
    job.status = 'published';
    job.updatedAt = new Date();
    
    await job.save();

    console.log('Job finalized and published:', jobId);

    return NextResponse.json({
      success: true,
      message: 'Job published successfully',
      jobId: job._id,
      interviewLink: interviewLink,
      vapiAssistantId: vapiAssistant.id
    });

  } catch (error) {
    console.error('Finalize job error:', error);
    return NextResponse.json(
      { error: `Failed to finalize job: ${error.message}` },
      { status: 500 }
    );
  }
}