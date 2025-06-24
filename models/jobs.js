// models/job.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'situational', 'general'],
    default: 'general'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  expectedDuration: {
    type: Number, // in seconds
    default: 60
  }
});

const jobSchema = new mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host',
    required: true
  },
  
  // Job Details
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  jobDescription: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: [5000, 'Job description cannot exceed 5000 characters']
  },
  jobResponsibilities: {
    type: String,
    required: [true, 'Job responsibilities are required'],
    trim: true,
    maxlength: [3000, 'Job responsibilities cannot exceed 3000 characters']
  },
  jobRequirements: {
    type: String,
    required: [true, 'Job requirements are required'],
    trim: true,
    maxlength: [3000, 'Job requirements cannot exceed 3000 characters']
  },
  jobType: {
    type: String,
    enum: ['internship', 'job'],
    required: true
  },
  jobImage: {
    type: String, // Cloudinary URL
    default: null
  },
  
  // Selection Criteria
  maxCandidatesShortlist: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  finalSelectionCount: {
    type: Number,
    required: true,
    min: 1
  },
  targetApplications: {
    type: Number,
    required: true,
    min: 1,
    max: 1000
  },
  voiceInterviewDuration: {
    type: Number, // in minutes
    required: true,
    min: 5,
    max: 60
  },
  
  // AI Generated Content
  interviewQuestions: [questionSchema],
  vapiCallId: {
    type: String,
    default: null
  },
  vapiAssistantId: {
    type: String,
    default: null
  },
  interviewLink: {
    type: String,
    default: null
  },
  
  // Status & Tracking
  status: {
    type: String,
    enum: ['draft', 'published', 'applications_open', 'applications_closed', 'interviews_active', 'completed', 'cancelled'],
    default: 'draft'
  },
  currentApplications: {
    type: Number,
    default: 0
  },
  shortlistedCandidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  finalSelectedCandidates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  
  // Dates
  applicationDeadline: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  },
  interviewStartDate: {
    type: Date,
    default: null
  },
  interviewEndDate: {
    type: Date,
    default: null
  },
  
  // Analytics
  totalViews: {
    type: Number,
    default: 0
  },
  completedInterviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
jobSchema.index({ hostId: 1, createdAt: -1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ jobType: 1, status: 1 });

// Validation
jobSchema.pre('save', function(next) {
  if (this.finalSelectionCount > this.maxCandidatesShortlist) {
    next(new Error('Final selection count cannot be greater than max candidates for shortlist'));
  }
  if (this.maxCandidatesShortlist > this.targetApplications) {
    next(new Error('Max candidates for shortlist cannot be greater than target applications'));
  }
  next();
});

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);