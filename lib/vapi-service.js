// lib/vapi-service.js
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_BASE_URL = 'https://api.vapi.ai';

// Create VAPI Assistant for Interview
export async function createVAPIAssistant({ jobTitle, questions, duration }) {
  try {
    const questionsText = questions.map((q, index) => 
      `${index + 1}. ${q.question} (Expected duration: ${q.expectedDuration}s)`
    ).join('\n');

    const systemPrompt = `
You are an AI interviewer conducting a ${duration}-minute interview for a ${jobTitle} position.

INTERVIEW QUESTIONS:
${questionsText}

INSTRUCTIONS:
1. Start with a warm greeting and brief introduction
2. Ask questions one by one in order
3. Allow candidate to fully answer before moving to next question
4. Ask follow-up questions if answers are too brief
5. Keep track of time and pace accordingly
6. End gracefully when time is up or all questions are covered
7. Be professional, encouraging, and conversational
8. If candidate asks about company/role, politely redirect to focus on their responses

IMPORTANT: 
- Wait for complete answers before proceeding
- Don't rush through questions
- Maintain natural conversation flow
- End with "Thank you for your time. Your interview has been completed."
`;

    const assistantConfig = {
      name: `${jobTitle} Interview Assistant`,
      model: {
        provider: "openai",
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: systemPrompt
          }
        ]
      },
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM", // Professional voice
        stability: 0.5,
        similarityBoost: 0.75
      },
      firstMessage: `Hello! Welcome to the ${jobTitle} interview. I'm excited to speak with you today. We have about ${duration} minutes together, and I'll be asking you several questions about your background and experience. Are you ready to begin?`,
      endCallFunctionEnabled: true,
      endCallMessage: "Thank you for your time. Your interview has been completed. Good luck!",
      maxDurationSeconds: duration * 60 + 120, // Add 2 minutes buffer
      silenceTimeoutSeconds: 10,
      responseDelaySeconds: 1,
      llmRequestDelaySeconds: 2,
      numWordsToInterruptAssistant: 3,
      backgroundSound: "none",
      backchannelingEnabled: true,
      backgroundDenoisingEnabled: true,
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US"
      }
    };

    const response = await fetch(`${VAPI_BASE_URL}/assistant`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assistantConfig)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`VAPI API error: ${error}`);
    }

    const assistant = await response.json();
    return assistant;

  } catch (error) {
    console.error('Create VAPI assistant error:', error);
    throw new Error('Failed to create interview assistant');
  }
}

// Generate Interview Link
export function generateInterviewLink(assistantId, jobId) {
  // This creates a link that when clicked, starts the VAPI call
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  return `${baseUrl}/interview/${jobId}?assistant=${assistantId}`;
}

// Start VAPI Call
export async function startVAPICall(assistantId, phoneNumber = null) {
  try {
    const callConfig = {
      assistantId: assistantId,
      phoneNumberId: phoneNumber, // For phone calls, null for web calls
    };

    const response = await fetch(`${VAPI_BASE_URL}/call`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(callConfig)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`VAPI call error: ${error}`);
    }

    const call = await response.json();
    return call;

  } catch (error) {
    console.error('Start VAPI call error:', error);
    throw new Error('Failed to start interview call');
  }
}

// Get Call Details
export async function getVAPICall(callId) {
  try {
    const response = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch call details');
    }

    const call = await response.json();
    return call;

  } catch (error) {
    console.error('Get VAPI call error:', error);
    throw new Error('Failed to get call details');
  }
}

// Process VAPI Webhook
export async function processVAPIWebhook(webhookData) {
  try {
    const { type, call } = webhookData;

    switch (type) {
      case 'call-started':
        console.log('Interview call started:', call.id);
        break;

      case 'call-ended':
        console.log('Interview call ended:', call.id);
        // Process the completed interview
        return await processCompletedInterview(call);

      case 'transcript':
        console.log('Interview transcript:', call.transcript);
        break;

      default:
        console.log('Unknown webhook type:', type);
    }

    return { success: true };

  } catch (error) {
    console.error('Process VAPI webhook error:', error);
    throw error;
  }
}

// Process Completed Interview
async function processCompletedInterview(call) {
  try {
    const { 
      id: callId,
      transcript,
      duration,
      assistantId,
      metadata 
    } = call;

    // Extract job and application info from metadata or URL
    const jobId = metadata?.jobId;
    const userId = metadata?.userId;

    if (!jobId || !userId) {
      console.error('Missing job or user ID in call metadata');
      return { success: false, error: 'Missing required IDs' };
    }

    // Get the job and questions
    const { Job, Application } = await import('@/models/job');
    await connectDB();

    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    const application = await Application.findOne({ jobId, userId });
    if (!application) {
      throw new Error('Application not found');
    }

    // Analyze the interview performance
    const { analyzeVoiceInterview } = await import('@/lib/ai-services');
    
    const interviewAnalysis = await analyzeVoiceInterview({
      transcript: transcript || '',
      questions: job.interviewQuestions,
      jobTitle: job.jobTitle,
      interviewDuration: duration,
      answeredQuestions: calculateAnsweredQuestions(transcript, job.interviewQuestions),
      totalQuestions: job.interviewQuestions.length
    });

    // Update application with interview results
    application.voiceInterviewCompleted = true;
    application.voiceInterviewScore = interviewAnalysis.overallPerformance;
    application.voiceInterviewFeedback = {
      ...interviewAnalysis,
      interviewDuration: duration,
      answeredQuestions: calculateAnsweredQuestions(transcript, job.interviewQuestions),
      totalQuestions: job.interviewQuestions.length
    };

    // Calculate final score (resume 60% + interview 40%)
    application.finalScore = Math.round(
      (application.atsScore * 0.6) + (interviewAnalysis.overallPerformance * 0.4)
    );

    application.status = 'interview_completed';
    application.interviewCompletedAt = new Date();

    await application.save();

    // Update job completion count
    job.completedInterviews = (job.completedInterviews || 0) + 1;
    await job.save();

    return { 
      success: true, 
      callId,
      applicationId: application._id,
      finalScore: application.finalScore
    };

  } catch (error) {
    console.error('Process completed interview error:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to estimate answered questions from transcript
function calculateAnsweredQuestions(transcript, questions) {
  if (!transcript || !questions.length) return 0;
  
  // Simple heuristic: count meaningful responses
  const responses = transcript.split(/interviewer|assistant/i).filter(r => 
    r.trim().length > 50 // Filter out short responses
  );
  
  return Math.min(responses.length, questions.length);
}

export default {
  createVAPIAssistant,
  generateInterviewLink,
  startVAPICall,
  getVAPICall,
  processVAPIWebhook
};