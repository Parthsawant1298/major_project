# HireAI Platform Setup Guide

## Overview
This guide will help you set up the complete HireAI Platform with all its features working end-to-end.

## Prerequisites
- Node.js 18+ installed
- MongoDB running locally or connection string to MongoDB Atlas
- OpenAI API key (or OpenRouter API key)
- VAPI account and API keys
- Email service setup (Gmail or other SMTP)
- Cloudinary account for file storage

## Quick Start

1. **Clone and Install Dependencies**
   ```bash
   cd major_project
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in all the required environment variables in `.env.local`

3. **Start MongoDB**
   Make sure MongoDB is running on your system or update MONGODB_URI for remote connection.

4. **Run the Application**
   ```bash
   npm run dev
   ```

## Detailed Configuration

### 1. Database Setup (MongoDB)
- Local: Install MongoDB and start the service
- Cloud: Use MongoDB Atlas and get connection string
- Update `MONGODB_URI` in your `.env.local`

### 2. AI Services Setup
- Get OpenAI API key from https://platform.openai.com/
- Or use OpenRouter for cheaper alternative: https://openrouter.ai/
- Update `OPENAI_API_KEY` in your `.env.local`

### 3. VAPI Setup (Voice Interview)
- Create account at https://vapi.ai/
- Get your Private Key and Public Key
- Update `VAPI_PRIVATE_KEY` and `NEXT_PUBLIC_VAPI_PUBLIC_KEY`

### 4. Email Service Setup
For Gmail:
- Enable 2-factor authentication
- Generate App Password
- Update SMTP configuration:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your_email@gmail.com
  SMTP_PASS=your_app_password
  FROM_EMAIL=your_email@gmail.com
  ```

### 5. File Storage Setup (Cloudinary)
- Create account at https://cloudinary.com/
- Get Cloud Name, API Key, and API Secret from dashboard
- Update Cloudinary configuration

## Complete Flow Testing

### Host Side (HR/Recruiter)
1. Register as Host at `/host/register`
2. Login at `/host/login`
3. Create a job at `/host/create-job`
   - Fill job details
   - Set candidate limits (e.g., 10 total applications, 5 for shortlist, 2 for final)
   - Set voice interview duration
4. Generate AI questions
5. Review and edit questions
6. Finalize job (creates VAPI assistant and interview link)
7. Job is now published and accepting applications

### User Side (Job Seekers)
1. Register at `/register`
2. Login at `/login`
3. Browse jobs at `/jobs`
4. Click on a job to see details
5. Apply by uploading resume
   - System prevents duplicate applications
   - AI analyzes resume automatically
6. Wait for shortlisting email

### Automated Processing
1. When target applications reached:
   - AI ranks all applications by resume match
   - Top N candidates get shortlisted automatically
   - Shortlist emails sent with interview links
   - Rejection emails sent to others

### Voice Interview Process
1. Shortlisted candidates receive email with interview link
2. Click link to access interview page
3. Grant microphone permission
4. Start AI voice interview
5. VAPI conducts the interview with generated questions
6. Interview completion triggers webhook
7. AI analyzes interview performance
8. Final scores calculated (Resume 60% + Interview 40%)

### Final Selection
1. Host views candidate dashboard
2. See all candidates with:
   - Resume analysis scores
   - Interview performance metrics
   - Final combined scores
   - Detailed AI feedback
3. Select final candidates for offers
4. Send offer letters via email templates

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/host/auth/register` - Host registration
- `POST /api/host/auth/login` - Host login

### Job Management
- `POST /api/host/jobs/create` - Create job
- `POST /api/host/jobs/[jobId]/questions/generate` - Generate AI questions
- `PUT /api/host/jobs/[jobId]/questions/update` - Update questions
- `POST /api/host/jobs/[jobId]/finalize` - Finalize job (create VAPI assistant)

### Applications
- `POST /api/jobs/[jobId]/apply` - Submit job application
- `GET /api/jobs/[jobId]/details` - Get job details
- `GET /api/jobs/[jobId]/shortlist` - Get shortlisted candidates (host only)

### Voice Interviews
- `POST /api/webhook/vapi` - VAPI webhook for interview processing
- `POST /api/interview/session` - Session tracking
- `GET /api/jobs/[jobId]/details?interview=true` - Interview access

### Final Selection
- `GET /api/host/jobs/[jobId]/candidates/rank` - Get final rankings
- `POST /api/host/jobs/[jobId]/candidates/finalize` - Select final candidates
- `POST /api/host/jobs/[jobId]/candidates/offer` - Send individual offers
- `POST /api/host/jobs/[jobId]/candidates/batch-offer` - Send batch offers

## Troubleshooting

### Common Issues

1. **VAPI Interview Not Working**
   - Check VAPI keys are correct
   - Ensure webhook URL is accessible
   - Check microphone permissions

2. **Email Not Sending**
   - Verify SMTP credentials
   - Check Gmail app password if using Gmail
   - Ensure FROM_EMAIL is valid

3. **File Upload Issues**
   - Check Cloudinary credentials
   - Verify file size limits
   - Ensure PDF parsing works

4. **Database Connection**
   - Verify MongoDB is running
   - Check connection string format
   - Ensure network access for cloud DB

### Logs and Debugging
- Check browser console for frontend errors
- Check terminal/server logs for backend errors
- Use MongoDB Compass to inspect database
- Test API endpoints with Postman/curl

## Production Deployment

### Environment Variables
- Set `NODE_ENV=production`
- Use secure JWT_SECRET
- Use production database
- Configure proper CORS settings

### Security Checklist
- Enable HTTPS
- Set secure cookies
- Validate all inputs
- Rate limit API endpoints
- Secure database access

### Performance Optimization
- Enable Next.js compression
- Use CDN for static assets
- Optimize database queries
- Cache frequently accessed data

## Support

If you encounter issues:
1. Check this setup guide first
2. Review error logs carefully
3. Test individual components
4. Verify all environment variables
5. Check API endpoint responses

The platform is now ready for end-to-end testing with all features working!