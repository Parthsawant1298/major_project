"use client";

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [user, setUser] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const jobId = "68ab266fad212663d3260a03";

  useEffect(() => {
    checkCurrentStatus();
  }, []);

  const checkCurrentStatus = async () => {
    try {
      // Get current user
      const userResponse = await fetch('/api/auth/user', { credentials: 'include' });
      const userData = await userResponse.json();
      
      if (userData.success) {
        setUser(userData.user);
        
        // Check application status
        const statusResponse = await fetch(`/api/debug/application-status?jobId=${jobId}`, {
          credentials: 'include'
        });
        const statusData = await statusResponse.json();
        setApplicationStatus(statusData);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!user) return;
    
    setUpdating(true);
    try {
      const response = await fetch('/api/debug/update-application-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: jobId,
          userId: user._id,
          status: newStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Status updated to: ${newStatus}`);
        checkCurrentStatus();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error updating status: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Debug Panel - Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Panel - Interview Access</h1>
        
        {user && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Current User</h2>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user._id}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Application Status</h2>
          {applicationStatus ? (
            <div>
              <p><strong>Job ID:</strong> {applicationStatus.jobId}</p>
              <p><strong>Has Application:</strong> {applicationStatus.hasApplication ? 'Yes' : 'No'}</p>
              <p><strong>Current Status:</strong> {applicationStatus.application?.status || 'No application found'}</p>
              <p><strong>Allowed for Interview:</strong> {applicationStatus.allowedForInterview ? 'Yes' : 'No'}</p>
              
              {applicationStatus.application && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <p><strong>Applied:</strong> {new Date(applicationStatus.application.appliedAt).toLocaleString()}</p>
                  <p><strong>ATS Score:</strong> {applicationStatus.application.atsScore}</p>
                </div>
              )}
            </div>
          ) : (
            <p>No application data found</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Fixes</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => updateStatus('shortlisted')}
              disabled={updating}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Set Status to "shortlisted"'}
            </button>
            
            <button
              onClick={() => updateStatus('interview_scheduled')}
              disabled={updating}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Set Status to "interview_scheduled"'}
            </button>

            <button
              onClick={checkCurrentStatus}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              Refresh Status
            </button>

            <div className="mt-4 pt-4 border-t">
              <a
                href="/interview/68ab266fad212663d3260a03?assistant=400b38ad-ae03-4124-aaa8-95bec0b518aa"
                className="block w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 text-center"
              >
                Test Interview Link
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}