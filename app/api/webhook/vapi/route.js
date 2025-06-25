// FIXED: app/api/webhook/vapi/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Job, Application } from '@/models/job';
import { analyzeVoiceInterview } from '@/lib/ai-services';

export async function POST(request) {
  try {
    console.log('VAPI webhook received');
    
    const webhookData = await request.json();
    console.log('Webhook data:', JSON.stringify(webhookData, null, 2));

    const { type, call } = webhookData;

    switch (type) {
      case 'call-start':
        console.log('Interview call started:', call?.id);
        break;

      case 'call-end':
        console.log('Interview call ended:', call?.id);
        return await processCompletedInterview(call);

      case 'transcript':
        console.log('Interview transcript received for call:', call?.id);
        break;

      default:
        console.log('Unknown webhook type:', type);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('VAPI webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}

// FIXED: Process completed interview with proper metadata extraction
async function processCompletedInterview(call) {
  try {
    if (!call) {
      throw new Error('Call data is missing');
    }

    const { 
      id: callId,
      transcript = '',
      duration = 0,
      metadata = {},
      // FIXED: Extract from assistant metadata if available
      assistant = {}
    } = call;

    console.log('Processing completed interview:', {
      callId,
      duration,
      metadata,
      assistantMetadata: assistant.metadata,
      transcriptLength: transcript.length
    });

    // FIXED: Extract job and user info from multiple sources
    let jobId = metadata.jobId || assistant.metadata?.jobId;
    let userId = metadata.userId || assistant.metadata?.userId;

    // If still not found, try to extract from URL pattern in call context
    if (!jobId || !userId) {
      console.log('Missing metadata, trying to extract from call context...');
      
      // Try to extract from call.phoneNumber or other call properties
      if (call.phoneNumber && call.phoneNumber.includes('/interview/')) {
        const urlMatch = call.phoneNumber.match(/\/interview\/([^\/\?]+)/);
        if (urlMatch) {
          jobId = urlMatch[1];
        }
      }
      
      // If we have jobId but no userId, we need to identify the user somehow
      if (jobId && !userId) {
        console.error('JobId found but userId missing. Need user identification mechanism.');
        throw new Error('Cannot identify user for this interview');
      }
    }

    if (!jobId || !userId) {
      console.error('Missing required job or user ID in call data:', {
        metadata,
        assistantMetadata: assistant.metadata,
        callId
      });
      throw new Error('Missing required job or user ID in call data');
    }

    await connectDB();

    // Get the job and questions
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // Find the application
    const application = await Application.findOne({ 
      jobId, 
      userId,
      status: { $in: ['shortlisted', 'interview_scheduled'] }
    }).populate('userId', 'name email');

    if (!application) {
      throw new Error(`Application not found for job ${jobId} and user ${userId}`);
    }

    console.log('Found application:', application._id);

    // Analyze the interview performance
    const interviewAnalysis = await analyzeVoiceInterview({
      transcript: transcript,
      questions: job.interviewQuestions || [],
      jobTitle: job.jobTitle,
      interviewDuration: duration,
      answeredQuestions: calculateAnsweredQuestions(transcript, job.interviewQuestions || []),
      totalQuestions: job.interviewQuestions?.length || 0
    });

    console.log('Interview analysis completed:', {
      overallPerformance: interviewAnalysis.overallPerformance,
      communicationSkills: interviewAnalysis.communicationSkills
    });

    // Update application with interview results
    application.voiceInterviewCompleted = true;
    application.voiceInterviewScore = interviewAnalysis.overallPerformance;
    application.voiceInterviewFeedback = {
      ...interviewAnalysis,
      interviewDuration: duration,
      answeredQuestions: calculateAnsweredQuestions(transcript, job.interviewQuestions || []),
      totalQuestions: job.interviewQuestions?.length || 0,
      transcript: transcript.substring(0, 1000) // Store first 1000 chars for reference
    };

    // FIXED: Calculate final score (resume 60% + interview 40%)
    const resumeScore = application.atsScore || 0;
    const interviewScore = interviewAnalysis.overallPerformance || 0;
    
    application.finalScore = Math.round(
      (resumeScore * 0.6) + (interviewScore * 0.4)
    );

    application.status = 'interview_completed';
    application.interviewCompletedAt = new Date();

    await application.save();

    // Update job completion count
    await Job.findByIdAndUpdate(jobId, { 
      $inc: { completedInterviews: 1 }
    });

    console.log('Interview processing completed successfully:', {
      applicationId: application._id,
      finalScore: application.finalScore,
      interviewScore: interviewScore
    });

    // FIXED: Send interview completion email
    try {
      const { sendInterviewCompletionEmail } = await import('@/lib/email-service');
      await sendInterviewCompletionEmail({
        user: application.userId,
        job: job,
        finalScore: application.finalScore,
        interviewScore: interviewScore
      });
    } catch (emailError) {
      console.error('Failed to send interview completion email:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      callId,
      applicationId: application._id,
      finalScore: application.finalScore,
      message: 'Interview processed successfully'
    });

  } catch (error) {
    console.error('Process completed interview error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      callId: call?.id
    }, { status: 500 });
  }
}

// Helper function to estimate answered questions from transcript
function calculateAnsweredQuestions(transcript, questions) {
  if (!transcript || !questions || questions.length === 0) {
    return 0;
  }
  
  // Simple heuristic: count meaningful responses
  // Split by common interview patterns and filter meaningful responses
  const candidateResponses = transcript
    .split(/(?:interviewer|assistant|ai)[\s:]/i)
    .filter(response => {
      const cleaned = response.trim().toLowerCase();
      return cleaned.length > 30 && // Minimum response length
             !cleaned.startsWith('thank you') &&
             !cleaned.startsWith('hello') &&
             !cleaned.includes('next question');
    });
  
  // Return the minimum of responses found or total questions
  return Math.min(candidateResponses.length, questions.length);
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'VAPI webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}