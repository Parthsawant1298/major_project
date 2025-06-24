// lib/ai-services.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.APP_URL,
    'X-Title': 'HireAI Platform'
  }
});

// Generate Interview Questions
export async function generateInterviewQuestions({ 
  jobTitle, 
  jobDescription, 
  jobRequirements, 
  jobType, 
  interviewDuration 
}) {
  try {
    const questionsNeeded = Math.max(5, Math.floor(interviewDuration / 2)); // 2 minutes per question average
    
    const prompt = `
    Generate ${questionsNeeded} interview questions for a ${jobType} position.
    
    Job Title: ${jobTitle}
    Job Description: ${jobDescription}
    Requirements: ${jobRequirements}
    Interview Duration: ${interviewDuration} minutes
    
    Create a mix of:
    - 30% Technical questions (specific to the role)
    - 30% Behavioral questions (teamwork, leadership, problem-solving)
    - 25% Situational questions (how they handle specific scenarios)
    - 15% General questions (motivation, career goals)
    
    Return ONLY a JSON array in this exact format:
    [
      {
        "question": "Question text here",
        "type": "technical|behavioral|situational|general",
        "difficulty": "easy|medium|hard",
        "expectedDuration": 120
      }
    ]
    
    Make questions relevant, professional, and appropriate for the role level.
    `;

    const response = await openai.chat.completions.create({
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR professional and interview specialist. Generate high-quality, relevant interview questions based on job requirements.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content.trim();
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    const questions = JSON.parse(jsonMatch[0]);
    
    // Validate and ensure proper format
    return questions.map(q => ({
      question: q.question || '',
      type: ['technical', 'behavioral', 'situational', 'general'].includes(q.type) ? q.type : 'general',
      difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
      expectedDuration: q.expectedDuration || 120
    }));

  } catch (error) {
    console.error('AI question generation error:', error);
    
    // Fallback questions if AI fails
    return getDefaultQuestions(jobType);
  }
}

// Analyze Resume against Job Description
export async function analyzeResume({ resumeText, jobDescription, jobRequirements, jobTitle }) {
  try {
    const prompt = `
    Analyze this resume against the job requirements and provide detailed scoring and feedback.
    
    Job Title: ${jobTitle}
    Job Description: ${jobDescription}
    Job Requirements: ${jobRequirements}
    
    Resume Content:
    ${resumeText}
    
    Provide analysis in this EXACT JSON format:
    {
      "atsScore": 85,
      "skillsMatch": 90,
      "experienceMatch": 80,
      "overallFit": 85,
      "strengths": ["Strong technical skills", "Relevant experience"],
      "weaknesses": ["Limited leadership experience", "Missing specific certification"],
      "recommendations": ["Consider highlighting project management experience", "Add relevant certifications"],
      "detailedFeedback": "Detailed analysis paragraph here..."
    }
    
    Scoring should be 0-100. Be thorough but constructive in feedback.
    `;

    const response = await openai.chat.completions.create({
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [
        {
          role: 'system',
          content: 'You are an expert ATS system and recruitment specialist. Analyze resumes objectively and provide constructive feedback.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    const content = response.choices[0].message.content.trim();
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid analysis response format');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate scores are within range
    const validatedAnalysis = {
      atsScore: Math.max(0, Math.min(100, analysis.atsScore || 0)),
      skillsMatch: Math.max(0, Math.min(100, analysis.skillsMatch || 0)),
      experienceMatch: Math.max(0, Math.min(100, analysis.experienceMatch || 0)),
      overallFit: Math.max(0, Math.min(100, analysis.overallFit || 0)),
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
      weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
      detailedFeedback: analysis.detailedFeedback || 'Analysis completed successfully.'
    };

    return validatedAnalysis;

  } catch (error) {
    console.error('Resume analysis error:', error);
    
    // Return default analysis if AI fails
    return {
      atsScore: 50,
      skillsMatch: 50,
      experienceMatch: 50,
      overallFit: 50,
      strengths: ['Resume submitted for review'],
      weaknesses: ['Requires manual review'],
      recommendations: ['Manual review recommended'],
      detailedFeedback: 'Automated analysis unavailable. Manual review required.'
    };
  }
}

// Analyze Voice Interview Performance
export async function analyzeVoiceInterview({ 
  transcript, 
  questions, 
  jobTitle, 
  interviewDuration,
  answeredQuestions,
  totalQuestions 
}) {
  try {
    const prompt = `
    Analyze this voice interview performance and provide detailed scoring.
    
    Job Title: ${jobTitle}
    Interview Duration: ${interviewDuration} seconds
    Questions Answered: ${answeredQuestions}/${totalQuestions}
    
    Interview Questions:
    ${questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}
    
    Interview Transcript:
    ${transcript}
    
    Provide analysis in this EXACT JSON format:
    {
      "communicationSkills": 85,
      "technicalKnowledge": 80,
      "problemSolving": 75,
      "confidence": 90,
      "overallPerformance": 82,
      "detailedFeedback": "Detailed performance analysis here...",
      "keyPoints": ["Strong communication", "Good technical knowledge"],
      "areasForImprovement": ["Could elaborate more on examples"]
    }
    
    Score each area 0-100 based on:
    - Communication: Clarity, articulation, listening skills
    - Technical Knowledge: Relevant expertise and understanding
    - Problem Solving: Logical thinking and approach
    - Confidence: Self-assurance and composure
    - Overall Performance: Holistic assessment
    `;

    const response = await openai.chat.completions.create({
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview assessor and communication specialist. Analyze interview performance objectively and constructively.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1200
    });

    const content = response.choices[0].message.content.trim();
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid interview analysis response format');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate and return
    return {
      communicationSkills: Math.max(0, Math.min(100, analysis.communicationSkills || 50)),
      technicalKnowledge: Math.max(0, Math.min(100, analysis.technicalKnowledge || 50)),
      problemSolving: Math.max(0, Math.min(100, analysis.problemSolving || 50)),
      confidence: Math.max(0, Math.min(100, analysis.confidence || 50)),
      overallPerformance: Math.max(0, Math.min(100, analysis.overallPerformance || 50)),
      detailedFeedback: analysis.detailedFeedback || 'Interview analysis completed.',
      keyPoints: Array.isArray(analysis.keyPoints) ? analysis.keyPoints : [],
      areasForImprovement: Array.isArray(analysis.areasForImprovement) ? analysis.areasForImprovement : []
    };

  } catch (error) {
    console.error('Voice interview analysis error:', error);
    
    // Return default analysis
    return {
      communicationSkills: 50,
      technicalKnowledge: 50,
      problemSolving: 50,
      confidence: 50,
      overallPerformance: 50,
      detailedFeedback: 'Interview analysis unavailable. Manual review required.',
      keyPoints: ['Interview completed'],
      areasForImprovement: ['Manual review recommended']
    };
  }
}

// Fallback questions if AI generation fails
function getDefaultQuestions(jobType) {
  const defaultQuestions = {
    job: [
      {
        question: "Tell me about yourself and your professional background.",
        type: "general",
        difficulty: "easy",
        expectedDuration: 120
      },
      {
        question: "What interests you most about this position?",
        type: "behavioral",
        difficulty: "easy",
        expectedDuration: 90
      },
      {
        question: "Describe a challenging project you worked on and how you overcame obstacles.",
        type: "behavioral",
        difficulty: "medium",
        expectedDuration: 180
      },
      {
        question: "How do you stay updated with industry trends and technologies?",
        type: "technical",
        difficulty: "medium",
        expectedDuration: 120
      },
      {
        question: "Where do you see yourself in 5 years?",
        type: "general",
        difficulty: "easy",
        expectedDuration: 90
      }
    ],
    internship: [
      {
        question: "Tell me about yourself and what you're studying.",
        type: "general",
        difficulty: "easy",
        expectedDuration: 120
      },
      {
        question: "Why are you interested in this internship opportunity?",
        type: "behavioral",
        difficulty: "easy",
        expectedDuration: 90
      },
      {
        question: "Describe a project or assignment you're proud of.",
        type: "behavioral",
        difficulty: "medium",
        expectedDuration: 150
      },
      {
        question: "How do you handle learning new concepts or technologies?",
        type: "behavioral",
        difficulty: "medium",
        expectedDuration: 120
      },
      {
        question: "What do you hope to gain from this internship experience?",
        type: "general",
        difficulty: "easy",
        expectedDuration: 90
      }
    ]
  };

  return defaultQuestions[jobType] || defaultQuestions.job;
}