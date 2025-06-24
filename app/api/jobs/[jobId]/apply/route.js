// app/api/jobs/[jobId]/apply/route.js
import { NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';
import connectDB from '@/lib/mongodb';
import { Job, Application } from '@/models/job';
import { analyzeResume } from '@/lib/ai-services';
import { sendShortlistEmail } from '@/lib/email-service';
import { extractTextFromPDF } from '@/lib/pdf-utils';

export async function POST(request, { params }) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { jobId } = params;

    await connectDB();

    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if applications are still open
    if (job.currentApplications >= job.targetApplications) {
      return NextResponse.json(
        { error: 'Application slots are full' },
        { status: 400 }
      );
    }

    if (job.status !== 'published') {
      return NextResponse.json(
        { error: 'Job is not accepting applications' },
        { status: 400 }
      );
    }

    if (new Date() > job.applicationDeadline) {
      return NextResponse.json(
        { error: 'Application deadline has passed' },
        { status: 400 }
      );
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      jobId: jobId,
      userId: user._id
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 400 }
      );
    }

    // Process form data
    const formData = await request.formData();
    const resumeFile = formData.get('resume');
    const coverLetter = formData.get('coverLetter')?.trim();

    if (!resumeFile) {
      return NextResponse.json(
        { error: 'Resume is required' },
        { status: 400 }
      );
    }

    // Validate resume file
    if (resumeFile.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: 'Resume file size must be less than 10MB' },
        { status: 400 }
      );
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(resumeFile.type)) {
      return NextResponse.json(
        { error: 'Only PDF and Word documents are allowed' },
        { status: 400 }
      );
    }

    // Upload resume to Cloudinary
    const { uploadToCloudinary } = await import('@/lib/cloudinary');
    const bytes = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadResult = await uploadToCloudinary(buffer, resumeFile.name, 'resumes');

    // Extract text from resume for AI analysis
    const resumeText = await extractTextFromPDF(buffer, resumeFile.type);

    // Analyze resume with AI
    const aiAnalysis = await analyzeResume({
      resumeText,
      jobDescription: job.jobDescription,
      jobRequirements: job.jobRequirements,
      jobTitle: job.jobTitle
    });

    // Create application
    const application = await Application.create({
      jobId: jobId,
      userId: user._id,
      resumeUrl: uploadResult.secure_url,
      resumeFilename: resumeFile.name,
      coverLetter: coverLetter,
      atsScore: aiAnalysis.atsScore,
      aiAnalysis: aiAnalysis,
      finalScore: aiAnalysis.overallFit, // Initial score based on resume
      status: 'applied'
    });

    // Update job application count
    await Job.findByIdAndUpdate(jobId, { 
      $inc: { currentApplications: 1 }
    });

    // Check if we've reached target applications and trigger shortlisting
    const updatedJob = await Job.findById(jobId);
    if (updatedJob.currentApplications >= updatedJob.targetApplications) {
      // Trigger shortlisting process
      await processShortlisting(jobId);
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: application._id,
      atsScore: aiAnalysis.atsScore
    }, { status: 201 });

  } catch (error) {
    console.error('Job application error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}

// Process shortlisting when target applications reached
async function processShortlisting(jobId) {
  try {
    const job = await Job.findById(jobId).populate('hostId');
    if (!job) return;

    // Get all applications for this job
    const applications = await Application.find({ jobId })
      .populate('userId', 'name email')
      .sort({ finalScore: -1 });

    // Select top candidates for shortlist
    const shortlistedApps = applications.slice(0, job.maxCandidatesShortlist);
    const rejectedApps = applications.slice(job.maxCandidatesShortlist);

    // Update application statuses and rankings
    for (let i = 0; i < shortlistedApps.length; i++) {
      const app = shortlistedApps[i];
      app.status = 'shortlisted';
      app.ranking = i + 1;
      await app.save();

      // Send shortlist email
      await sendShortlistEmail({
        user: app.userId,
        job: job,
        interviewLink: job.interviewLink,
        ranking: i + 1
      });
    }

    // Update rejected applications
    for (const app of rejectedApps) {
      app.status = 'rejected';
      await app.save();
    }

    // Update job with shortlisted candidates
    job.shortlistedCandidates = shortlistedApps.map(app => app._id);
    job.status = 'interviews_active';
    await job.save();

    console.log(`Shortlisting completed for job ${jobId}. Selected ${shortlistedApps.length} candidates.`);

  } catch (error) {
    console.error('Shortlisting process error:', error);
  }
}