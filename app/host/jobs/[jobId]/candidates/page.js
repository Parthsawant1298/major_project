// 📄 5. HOST CANDIDATES DASHBOARD
// File: app/host/jobs/[jobId]/candidates/page.js
// =================
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Download, Eye, Mail, Star, Filter } from 'lucide-react';
import Navbar from '@/components/Host/Navbar';
import Footer from '@/components/Footer';

export default function CandidatesDashboard() {
  const router = useRouter();
  const params = useParams();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.jobId}/shortlist`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setJob(data.job);
        setCandidates(data.candidates);
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleFinalizeSelection = async () => {
    if (selectedCandidates.length === 0) {
      alert('Please select at least one candidate');
      return;
    }

    if (selectedCandidates.length > job.finalSelectionCount) {
      alert(`You can only select ${job.finalSelectionCount} candidates for final selection`);
      return;
    }

    try {
      const response = await fetch(`/api/host/jobs/${params.jobId}/candidates/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ selectedCandidateIds: selectedCandidates })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Final selection completed! Offer emails will be sent to selected candidates.');
        fetchCandidates();
      } else {
        alert(data.error || 'Failed to finalize selection');
      }
    } catch (error) {
      console.error('Failed to finalize selection:', error);
      alert('Failed to finalize selection. Please try again.');
    }
  };

  const filteredCandidates = candidates.filter(candidate => 
    !statusFilter || candidate.status === statusFilter
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Dashboard</h1>
            <p className="text-gray-600">{job?.jobTitle} - {candidates.length} candidates shortlisted</p>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview_completed">Interview Completed</option>
                  <option value="selected">Selected</option>
                </select>
                
                <div className="text-sm text-gray-600">
                  {selectedCandidates.length} selected for final round
                </div>
              </div>

              <div className="flex space-x-3">
                {selectedCandidates.length > 0 && (
                  <button
                    onClick={handleFinalizeSelection}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Finalize Selection ({selectedCandidates.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Candidates List */}
          <div className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isSelected={selectedCandidates.includes(candidate.id)}
                onSelect={() => handleSelectCandidate(candidate.id)}
                job={job}
              />
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

function CandidateCard({ candidate, isSelected, onSelect, job }) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted': return 'bg-blue-100 text-blue-700';
      case 'interview_completed': return 'bg-purple-100 text-purple-700';
      case 'selected': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start space-x-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="mt-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          {candidate.user.profilePicture ? (
            <img src={candidate.user.profilePicture} alt={candidate.user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-lg font-semibold text-gray-600">
              {candidate.user.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{candidate.user.name}</h3>
              <p className="text-gray-600">{candidate.user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                  {candidate.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-sm text-gray-600">Rank #{candidate.ranking}</span>
                <span className="text-sm text-gray-600">Applied {new Date(candidate.appliedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={candidate.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-600"
                title="Download Resume"
              >
                <Download className="h-4 w-4" />
              </a>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 text-gray-400 hover:text-blue-600"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{candidate.atsScore}%</div>
              <div className="text-xs text-gray-600">ATS Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{candidate.finalScore}%</div>
              <div className="text-xs text-gray-600">Final Score</div>
            </div>
            {candidate.voiceInterviewCompleted && (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{candidate.voiceInterviewScore}%</div>
                  <div className="text-xs text-gray-600">Interview</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(candidate.voiceInterviewScore / 20)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
              </>
            )}
          </div>

          {/* Detailed View */}
          {showDetails && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Analysis */}
                {candidate.aiAnalysis && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Resume Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Skills Match</span>
                        <span className="text-sm font-medium">{candidate.aiAnalysis.skillsMatch}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Experience Match</span>
                        <span className="text-sm font-medium">{candidate.aiAnalysis.experienceMatch}%</span>
                      </div>
                    </div>
                    {candidate.aiAnalysis.strengths && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-900 mb-1">Strengths:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                          {candidate.aiAnalysis.strengths.slice(0, 3).map((strength, index) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Interview Feedback */}
                {candidate.voiceInterviewFeedback && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Interview Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Communication</span>
                        <span className="text-sm font-medium">{candidate.voiceInterviewFeedback.communicationSkills}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Technical Knowledge</span>
                        <span className="text-sm font-medium">{candidate.voiceInterviewFeedback.technicalKnowledge}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Problem Solving</span>
                        <span className="text-sm font-medium">{candidate.voiceInterviewFeedback.problemSolving}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Confidence</span>
                        <span className="text-sm font-medium">{candidate.voiceInterviewFeedback.confidence}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
