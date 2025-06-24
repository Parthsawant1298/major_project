// File: app/interview/[jobId]/page.js
// =================
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';

export default function VoiceInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [job, setJob] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [vapiClient, setVapiClient] = useState(null);
  const assistantId = searchParams.get('assistant');

  useEffect(() => {
    fetchJobDetails();
    initializeVAPI();
  }, []);

  useEffect(() => {
    let interval;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.jobId}/details`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setJob(data.job);
      }
    } catch (error) {
      console.error('Failed to fetch job details:', error);
    }
  };

  const initializeVAPI = async () => {
    try {
      // Load VAPI SDK
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js';
      script.onload = () => {
        const client = new window.Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
        setVapiClient(client);

        // Setup event listeners
        client.on('call-start', () => {
          setIsCallActive(true);
        });

        client.on('call-end', () => {
          setIsCallActive(false);
          setIsCallEnded(true);
          setTimeout(() => {
            router.push(`/interview/${params.jobId}/completed`);
          }, 3000);
        });
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Failed to initialize VAPI:', error);
    }
  };

  const startInterview = async () => {
    if (!vapiClient || !assistantId) {
      alert('Interview system not ready. Please refresh and try again.');
      return;
    }

    try {
      await vapiClient.start(assistantId);
    } catch (error) {
      console.error('Failed to start interview:', error);
      alert('Failed to start interview. Please try again.');
    }
  };

  const endInterview = async () => {
    if (vapiClient) {
      vapiClient.stop();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Voice Interview</h1>
            <p className="text-gray-600">{job.jobTitle} at {job.hostId.organization}</p>
            <p className="text-sm text-gray-500 mt-2">Duration: {job.voiceInterviewDuration} minutes</p>
          </div>

          {/* Interview Status */}
          <div className="text-center mb-8">
            {!isCallActive && !isCallEnded && (
              <div>
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready to Start?</h2>
                <p className="text-gray-600 mb-6">
                  Make sure you're in a quiet environment with a good internet connection. 
                  The AI interviewer will ask you questions about your background and experience.
                </p>
                <button
                  onClick={startInterview}
                  className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 font-medium"
                >
                  Start Interview
                </button>
              </div>
            )}

            {isCallActive && (
              <div>
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Mic className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Interview in Progress</h2>
                <p className="text-gray-600 mb-4">Speak clearly and take your time to answer each question.</p>
                <div className="text-2xl font-bold text-gray-900 mb-4">{formatTime(callDuration)}</div>
                <button
                  onClick={endInterview}
                  className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700"
                >
                  <PhoneOff className="h-5 w-5 inline mr-2" />
                  End Interview
                </button>
              </div>
            )}

            {isCallEnded && (
              <div>
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Interview Completed!</h2>
                <p className="text-gray-600 mb-4">
                  Thank you for completing the interview. You'll be redirected to see your results shortly.
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}
          </div>

          {/* Interview Tips */}
          {!isCallActive && !isCallEnded && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Interview Tips:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Speak clearly and at a normal pace</li>
                <li>• Take a moment to think before answering</li>
                <li>• Be specific and provide examples when possible</li>
                <li>• If you don't understand a question, ask for clarification</li>
                <li>• Stay calm and be yourself</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
