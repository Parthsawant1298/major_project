// 📄 6. HOST JOBS MANAGEMENT PAGE
// File: app/host/jobs/page.js
// =================
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Users, BarChart3, Calendar } from 'lucide-react';
import Navbar from '@/components/host/Navbar';
import Footer from '@/components/Footer';

export default function HostJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/host/jobs/list?${params}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
              <p className="text-gray-600">Manage your job postings and track applications</p>
            </div>
            <button
              onClick={() => router.push('/host/create-job')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create New Job</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Jobs</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="applications_open">Applications Open</option>
                <option value="interviews_active">Interviews Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Jobs Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

function JobCard({ job }) {
  const router = useRouter();
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'published': return 'bg-green-100 text-green-700';
      case 'applications_open': return 'bg-blue-100 text-blue-700';
      case 'interviews_active': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {job.jobImage && (
        <img src={job.jobImage} alt={job.jobTitle} className="w-full h-32 object-cover rounded-lg mb-4" />
      )}
      
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{job.jobTitle}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
          {job.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.jobDescription}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-900">{job.currentApplications}</div>
          <div className="text-xs text-gray-600">Applications</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{job.shortlistedCandidates?.length || 0}</div>
          <div className="text-xs text-gray-600">Shortlisted</div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => router.push(`/host/jobs/${job._id}/candidates`)}
          className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center justify-center space-x-1"
        >
          <Users className="h-4 w-4" />
          <span>Candidates</span>
        </button>
        <button
          onClick={() => router.push(`/host/jobs/${job._id}/analytics`)}
          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center space-x-1"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Analytics</span>
        </button>
      </div>
    </div>
  );
}
