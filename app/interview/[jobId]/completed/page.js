// File: app/interview/[jobId]/completed/page.js
// =================
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle, Star, TrendingUp, MessageSquare } from 'lucide-react';

export default function InterviewCompletedPage() {
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  const fetchApplicationStatus = async () => {
    try {
      // This would need a new API endpoint to get user's application for this job
      const response = await fetch(`/api/user/applications?jobId=${params.jobId}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success && data.application) {
        setApplication(data.application);
        setJob(data.job);
      }
    } catch (error) {
      console.error('Failed to fetch application status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Completion Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Interview Completed Successfully!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for completing the AI voice interview for {job?.jobTitle} at {job?.hostId.organization}.
          </p>

          {/* Interview Results */}
          {application?.voiceInterviewCompleted ? (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Interview Results</h2>
              
              {/* Performance Summary */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Overall Performance</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {application.voiceInterviewScore || 0}/100
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${application.voiceInterviewScore || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Final Score</h3>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {application.finalScore || 0}/100
                  </div>
                  <div className="text-sm text-gray-600">
                    Resume ({application.atsScore || 0}) + Interview ({application.voiceInterviewScore || 0})
                  </div>
                </div>
              </div>

              {/* Detailed Feedback */}
              {application.voiceInterviewFeedback && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Performance Breakdown</h3>
                  
                  {/* Skills Breakdown */}
                  <div className="grid grid-cols-2 gap-4">
                    {application.voiceInterviewFeedback.communicationSkills && (
                      <div className="bg-white p-3 rounded">
                        <div className="text-sm text-gray-600">Communication</div>
                        <div className="text-lg font-semibold">{application.voiceInterviewFeedback.communicationSkills}/100</div>
                      </div>
                    )}
                    {application.voiceInterviewFeedback.technicalKnowledge && (
                      <div className="bg-white p-3 rounded">
                        <div className="text-sm text-gray-600">Technical Knowledge</div>
                        <div className="text-lg font-semibold">{application.voiceInterviewFeedback.technicalKnowledge}/100</div>
                      </div>
                    )}
                    {application.voiceInterviewFeedback.problemSolving && (
                      <div className="bg-white p-3 rounded">
                        <div className="text-sm text-gray-600">Problem Solving</div>
                        <div className="text-lg font-semibold">{application.voiceInterviewFeedback.problemSolving}/100</div>
                      </div>
                    )}
                    {application.voiceInterviewFeedback.confidence && (
                      <div className="bg-white p-3 rounded">
                        <div className="text-sm text-gray-600">Confidence</div>
                        <div className="text-lg font-semibold">{application.voiceInterviewFeedback.confidence}/100</div>
                      </div>
                    )}
                  </div>

                  {/* Interview Stats */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Interview Statistics</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-blue-600">Duration</div>
                        <div className="font-semibold">
                          {Math.floor((application.voiceInterviewFeedback.interviewDuration || 0) / 60)}m {((application.voiceInterviewFeedback.interviewDuration || 0) % 60)}s
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-600">Questions Answered</div>
                        <div className="font-semibold">
                          {application.voiceInterviewFeedback.answeredQuestions || 0}/{application.voiceInterviewFeedback.totalQuestions || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-600">Completion Rate</div>
                        <div className="font-semibold">
                          {Math.round(((application.voiceInterviewFeedback.answeredQuestions || 0) / (application.voiceInterviewFeedback.totalQuestions || 1)) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Feedback */}
                  {application.voiceInterviewFeedback.detailedFeedback && (
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-2">AI Feedback</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {application.voiceInterviewFeedback.detailedFeedback}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">What's Next?</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Your results have been shared with the hiring team</li>
                  <li>• You'll receive an email update about your application status</li>
                  <li>• Keep checking your email for further communications</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Interview Completed Successfully</h2>
              
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      <strong>Your interview has been completed and recorded successfully.</strong>
                    </p>
                    <p className="mt-2 text-sm text-green-600">
                      Our AI system is analyzing your responses. Results will be available shortly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Processing Interview...</h3>
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-800">Analyzing your responses...</span>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  Please refresh this page in a few minutes to see your results.
                </p>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Our AI will analyze your interview performance</li>
              <li>• Results will be shared with the hiring team</li>
              <li>• You'll receive an email update within 2-3 business days</li>
              <li>• Check your application status in your dashboard</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/jobs')}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium"
            >
              Browse More Jobs
            </button>
            <button
              onClick={() => router.push('/main')}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
