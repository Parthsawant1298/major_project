// models/application.js
const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Resume & Application
  resumeUrl: {
    type: String,
    required: true
  },
  resumeFilename: {
    type: String,
    required: true
  },
  coverLetter: {
    type: String,
    maxlength: 2000,
    trim: true
  },
  
  // AI Analysis Results
  atsScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  aiAnalysis: {
    skillsMatch: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    experienceMatch: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    overallFit: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    detailedFeedback: String
  },
  
  // Interview Results
  voiceInterviewCompleted: {
    type: Boolean,
    default: false
  },
  voiceInterviewScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  voiceInterviewFeedback: {
    communicationSkills: {
      type: Number,
      min: 0,
      max: 100
    },
    technicalKnowledge: {
      type: Number,
      min: 0,
      max: 100
    },
    problemSolving: {
      type: Number,
      min: 0,
      max: 100
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    overallPerformance: {
      type: Number,
      min: 0,
      max: 100
    },
    detailedFeedback: String,
    interviewDuration: Number, // in seconds
    answeredQuestions: Number,
    totalQuestions: Number
  },
  
  // Final Scores & Status
  finalScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interview_scheduled', 'interview_completed', 'selected', 'rejected', 'offer_sent'],
    default: 'applied'
  },
  ranking: {
    type: Number,
    default: 0
  },
  
  // Notifications
  shortlistEmailSent: {
    type: Boolean,
    default: false
  },
  rejectionEmailSent: {
    type: Boolean,
    default: false
  },
  offerEmailSent: {
    type: Boolean,
    default: false
  },
  
  // Interview Scheduling
  interviewScheduledAt: {
    type: Date,
    default: null
  },
  interviewCompletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1, status: 1, finalScore: -1 });
applicationSchema.index({ userId: 1, createdAt: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });

const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);

export { Job, Application };