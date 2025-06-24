"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, MapPin, Clock, Users, Briefcase, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function JobsListingPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchJobs();
  }, [currentPage, jobTypeFilter, searchTerm]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });
      
      if (jobTypeFilter) params.append('jobType', jobTypeFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/jobs/list?${params}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.jobs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Dream Job</h1>
            <p className="text-gray-600 mb-6">Discover amazing opportunities with AI-powered matching</p>
            
            {/* Search and Filter */}
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="job">Full-time Jobs</option>
                <option value="internship">Internships</option>
              </select>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    {pagination.hasPrev && (
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Previous
                      </button>
                    )}
                    <span className="px-4 py-2 text-gray-600">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    {pagination.hasNext && (
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

function JobCard({ job }) {
  const router = useRouter();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
         onClick={() => router.push(`/jobs/${job._id}`)}>
      {job.jobImage && (
        <img src={job.jobImage} alt={job.jobTitle} className="w-full h-32 object-cover rounded-lg mb-4" />
      )}
      
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          {job.hostId.profilePicture ? (
            <img src={job.hostId.profilePicture} alt={job.hostId.name} className="w-full h-full rounded-lg object-cover" />
          ) : (
            <Briefcase className="h-6 w-6 text-gray-400" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{job.jobTitle}</h3>
          <p className="text-sm text-gray-600">{job.hostId.organization}</p>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.jobDescription}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs ${job.jobType === 'job' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          {job.jobType === 'job' ? 'Full-time' : 'Internship'}
        </span>
        <span className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {job.voiceInterviewDuration}min interview
        </span>
      </div>

      {/* Application Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Applications</span>
          <span>{job.applicationProgress.current}/{job.applicationProgress.target}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(job.applicationProgress.percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
        Apply Now
      </button>
    </div>
  );
}
