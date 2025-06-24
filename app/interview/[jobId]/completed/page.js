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

          {/* Performance Summary */}
          {application?.voiceInterviewFeedback && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Performance Summary</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{application.voiceInterviewScore}%</div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{application.finalScore}%</div>
                  <div className="text-sm text-gray-600">Final Score</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Communication</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${application.voiceInterviewFeedback.communicationSkills}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{application.voiceInterviewFeedback.communicationSkills}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Technical Knowledge</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${application.voiceInterviewFeedback.technicalKnowledge}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{application.voiceInterviewFeedback.technicalKnowledge}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Problem Solving</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${application.voiceInterviewFeedback.problemSolving}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{application.voiceInterviewFeedback.problemSolving}%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Confidence</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${application.voiceInterviewFeedback.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{application.voiceInterviewFeedback.confidence}%</span>
                  </div>
                </div>
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
