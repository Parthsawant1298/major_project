# HireAI - HR/Host Side Documentation

## 🎯 Overview

HireAI is an AI-powered recruitment platform that streamlines the hiring process through intelligent resume analysis, automated interview scheduling, and voice-based AI interviews. This documentation covers the HR/Host side of the application.

## 🏗️ Architecture Overview

The HR side is built with Next.js 15 and follows a modular architecture with clear separation between UI, business logic, and data layers.

### Key Technologies
- **Frontend**: Next.js 15, React 19, TailwindCSS v4
- **Backend**: Node.js, Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **AI Services**: OpenAI/OpenRouter for resume analysis and question generation
- **Voice AI**: VAPI for voice interviews
- **File Storage**: Cloudinary for resume and job image uploads
- **Authentication**: JWT-based session management

## 📁 Project Structure

```
major_project/
├── app/
│   ├── host/                    # HR/Host pages
│   │   ├── dashboard/           # HR dashboard
│   │   ├── jobs/               # Job management
│   │   ├── analytics/          # Analytics and reports
│   │   ├── profile/            # HR profile management
│   │   ├── login/              # HR authentication
│   │   └── register/           # HR registration
│   └── api/
│       └── host/               # HR-specific API routes
│           ├── auth/           # Authentication endpoints
│           ├── jobs/           # Job management APIs
│           └── update-profile-picture/ # Profile management
├── components/
│   ├── Host/                   # HR-specific components
│   │   ├── Navbar.jsx         # HR navigation
│   │   ├── Profile.jsx        # HR profile component
│   │   ├── Createjob.jsx      # Job creation form
│   │   └── jobquestions.jsx   # Interview questions management
│   └── JobCard.jsx            # Reusable job card component
├── lib/
│   ├── mongodb.js             # Database connection
│   ├── ai-services.js         # AI integration services
│   ├── vapi-service.js        # Voice AI integration
│   ├── cloudinary.js          # File upload service
│   └── email-service.js       # Email notifications
└── models/
    ├── host.js                # HR user model
    ├── job.js                 # Job and Application models
    └── user.js                # Candidate user model
```

## 🔐 Authentication System

### HR Authentication Flow
1. **Registration**: `/app/host/register/page.js`
   - Company details collection
   - Email verification
   - Password encryption with bcryptjs

2. **Login**: `/app/host/login/page.js`
   - JWT token generation
   - Session management with httpOnly cookies
   - Automatic redirection to dashboard

3. **Authorization Middleware**: `/middleware/host-auth.js`
   - Protects HR-only routes
   - Validates JWT tokens
   - User session management

### API Endpoints
```javascript
// Authentication
POST /api/host/auth/register    // HR registration
POST /api/host/auth/login       // HR login  
POST /api/host/auth/logout      // HR logout
GET  /api/host/auth/user        // Get HR profile
```

## 💼 Job Management System

### Job Creation Workflow
1. **Job Form**: HR fills comprehensive job details
2. **AI Question Generation**: Automatic interview question creation
3. **Image Upload**: Optional job/company image via Cloudinary
4. **Publication**: Job goes live for candidate applications

### Job Management Features
- **CRUD Operations**: Create, read, update, delete jobs
- **Status Management**: Draft, published, active, completed, cancelled
- **Application Tracking**: Real-time application counting
- **Analytics**: Job performance metrics

### API Endpoints
```javascript
// Job Management
POST /api/host/jobs/create              // Create new job
GET  /api/host/jobs/list               // List HR's jobs
GET  /api/host/jobs/[jobId]/route      // Get job details
PUT  /api/host/jobs/[jobId]/edit       // Update job
DELETE /api/host/jobs/[jobId]/delete   // Delete/cancel job
GET  /api/host/jobs/[jobId]/analytics  // Job analytics
```

## 👥 Candidate Management System

### Application Processing Pipeline
1. **Resume Upload**: Candidates submit resumes (PDF/DOC)
2. **AI Analysis**: Automated resume evaluation using OpenAI
3. **ATS Scoring**: Skills, experience, and fit assessment
4. **Shortlisting**: HR reviews and shortlists candidates
5. **Interview Scheduling**: Voice AI interview setup
6. **Performance Analysis**: Post-interview AI evaluation
7. **Final Selection**: Combined scoring (Resume 60% + Interview 40%)

### Candidate Management Features
- **Resume Analysis**: AI-powered resume evaluation
- **Bulk Operations**: Mass shortlisting and offer sending
- **Interview Management**: Voice AI interview orchestration
- **Ranking System**: Intelligent candidate ranking
- **Communication**: Automated email notifications

### API Endpoints
```javascript
// Candidate Management
GET  /api/host/jobs/[jobId]/candidates           // List candidates
POST /api/host/jobs/[jobId]/candidates/shortlist // Shortlist candidates
POST /api/host/jobs/[jobId]/candidates/offer     // Send job offers
POST /api/host/jobs/[jobId]/candidates/batch-offer // Bulk offers
POST /api/host/jobs/[jobId]/candidates/rank      // Rank candidates
```

## 🤖 AI Integration

### Resume Analysis Service (`lib/ai-services.js`)
- **Provider**: OpenAI via OpenRouter
- **Model**: GPT-4o-mini for cost efficiency
- **Analysis Metrics**:
  - ATS Score (0-100)
  - Skills Match (0-100)
  - Experience Match (0-100)
  - Overall Fit (0-100)
- **Output**: Detailed feedback, strengths, weaknesses, recommendations

### Interview Question Generation
- **Context-Aware**: Based on job description and requirements
- **Question Types**: Technical (30%), Behavioral (30%), Situational (25%), General (15%)
- **Difficulty Levels**: Easy, Medium, Hard
- **Duration Estimation**: Expected answer time per question

### Voice Interview Analysis (`lib/vapi-service.js`)
- **Provider**: VAPI AI for voice interactions
- **Metrics**: Communication, Technical Knowledge, Problem Solving, Confidence
- **Real-time**: Live interview transcription and analysis
- **Scoring**: Combined performance evaluation

## 📊 Analytics & Reporting

### Job Analytics
- **Application Metrics**: Total applications, completion rates
- **Performance Tracking**: Interview completion rates
- **Time-based Analysis**: Application trends over time
- **Candidate Quality**: Average scores and rankings

### Dashboard Metrics
- **Overview Stats**: Total jobs, applications, interviews
- **Recent Activity**: Latest applications and status updates
- **Quick Actions**: Direct access to common tasks
- **Performance Insights**: Success rates and metrics

## 🗄️ Database Schema

### Host Model
```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String (unique),
  password: String (hashed),
  companyName: String,
  designation: String,
  profilePicture: String (Cloudinary URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Job Model
```javascript
{
  _id: ObjectId,
  hostId: ObjectId (ref: Host),
  jobTitle: String,
  jobDescription: Text,
  jobResponsibilities: Text,
  jobRequirements: Text,
  jobType: Enum ['job', 'internship'],
  jobImage: String (Cloudinary URL),
  maxCandidatesShortlist: Number,
  finalSelectionCount: Number,
  targetApplications: Number,
  voiceInterviewDuration: Number,
  interviewQuestions: Array,
  status: Enum ['draft', 'published', 'applications_open', 'interviews_active', 'completed', 'cancelled'],
  currentApplications: Number,
  completedInterviews: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Application Model
```javascript
{
  _id: ObjectId,
  jobId: ObjectId (ref: Job),
  userId: ObjectId (ref: User),
  resumeUrl: String (Cloudinary URL),
  resumeText: Text,
  resumeAnalysis: Object {
    atsScore: Number,
    skillsMatch: Number,
    experienceMatch: Number,
    overallFit: Number,
    strengths: Array,
    weaknesses: Array,
    recommendations: Array,
    detailedFeedback: String
  },
  atsScore: Number,
  status: Enum ['applied', 'shortlisted', 'interview_scheduled', 'interview_completed', 'selected', 'rejected'],
  voiceInterviewCompleted: Boolean,
  voiceInterviewScore: Number,
  voiceInterviewFeedback: Object,
  finalScore: Number,
  appliedAt: Date,
  interviewCompletedAt: Date,
  updatedAt: Date
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- OpenAI API key (via OpenRouter)
- VAPI account and API keys
- Cloudinary account

### Environment Variables
```env
# Database
MONGODB_URI=mongodb+srv://...

# OpenAI/OpenRouter
OPENAI_API_KEY=sk-or-v1-...
APP_URL=https://your-domain.com

# VAPI Integration  
VAPI_PRIVATE_KEY=your-private-key
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your-public-key
VAPI_BASE_URL=https://api.vapi.ai
VAPI_WEBHOOK_SECRET=your-webhook-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key  
CLOUDINARY_API_SECRET=your-api-secret

# JWT
JWT_SECRET=your-jwt-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Installation
```bash
# Clone repository
git clone <repository-url>
cd major_project

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Development Workflow
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📱 HR Dashboard Features

### Dashboard Overview (`/host/dashboard`)
- **Quick Stats**: Jobs, applications, interviews summary
- **Recent Activity**: Latest candidate actions
- **Quick Actions**: Create job, view applications
- **Performance Metrics**: Success rates and analytics

### Job Management (`/host/jobs`)
- **Job Listing**: All jobs with filters and status
- **Job Creation**: Comprehensive job posting form
- **Job Editing**: Update job details and requirements
- **Application Tracking**: Real-time application monitoring

### Candidate Management (`/host/jobs/[id]/candidates`)
- **Application Review**: Detailed candidate profiles
- **Resume Analysis**: AI-powered resume evaluation
- **Interview Scheduling**: Voice AI interview setup
- **Selection Process**: Ranking and offer management

### Analytics (`/host/analytics`)
- **Job Performance**: Application and completion metrics
- **Candidate Quality**: Average scores and feedback
- **Time Analysis**: Recruitment timeline insights
- **Success Metrics**: Hiring success rates

## 🔧 API Documentation

### Authentication Middleware
All HR routes are protected by authentication middleware that validates JWT tokens and ensures proper authorization.

### Error Handling
Comprehensive error handling with proper HTTP status codes and user-friendly error messages.

### Rate Limiting
API endpoints include rate limiting to prevent abuse and ensure system stability.

### Response Format
Standardized JSON responses with success indicators and error details.

## 🎨 UI/UX Components

### Responsive Design
- **Mobile-First**: Fully responsive across all devices
- **TailwindCSS**: Utility-first CSS framework
- **Component Library**: Reusable UI components

### Key Components
- **Navbar**: HR navigation with profile management
- **JobCard**: Reusable job display component
- **Forms**: Comprehensive form handling with validation
- **Modals**: Interactive dialogs for confirmations
- **Analytics Charts**: Data visualization components

## 🔍 Testing & Quality

### Code Quality
- **ESLint**: Code linting and formatting
- **Error Boundaries**: React error handling
- **Input Validation**: Comprehensive form validation
- **Type Safety**: Proper data type handling

### Performance
- **Next.js Optimization**: Built-in performance optimizations
- **Image Optimization**: Cloudinary for optimized images
- **Lazy Loading**: Component-level lazy loading
- **Caching**: Efficient data caching strategies

## 📈 Scalability & Performance

### Database Optimization
- **Indexing**: Optimized database queries
- **Connection Pooling**: Efficient database connections
- **Data Pagination**: Large dataset handling

### Caching Strategy
- **API Caching**: Response caching for frequently accessed data
- **Static Asset Optimization**: CDN integration via Cloudinary
- **Client-Side Caching**: React state management optimization

## 🔒 Security Features

### Data Protection
- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Secure session management
- **Input Sanitization**: XSS and injection attack prevention
- **File Upload Security**: Safe file handling and validation

### Privacy Compliance
- **Data Encryption**: Sensitive data encryption
- **Access Control**: Role-based access management
- **Audit Logging**: Activity tracking and logging

## 🚀 Deployment

### Production Setup
- **Environment Configuration**: Production environment variables
- **Database Migration**: MongoDB Atlas setup
- **CDN Configuration**: Cloudinary integration
- **Domain Setup**: Custom domain configuration

### Monitoring
- **Error Tracking**: Production error monitoring
- **Performance Monitoring**: Application performance metrics
- **Database Monitoring**: MongoDB performance tracking

---

## 📞 Support & Contact

For questions or support regarding the HR side of the HireAI platform, please refer to the main project documentation or contact the development team.

### Version Information
- **Current Version**: 0.1.0
- **Node.js**: 18+
- **Next.js**: 15.5.2
- **React**: 19.0.0

---

*This documentation covers the HR/Host side architecture and implementation. For candidate-side documentation, please refer to the main README.md file.*