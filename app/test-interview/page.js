"use client";

import { useState } from 'react';
import Vapi from '@vapi-ai/web';

export default function TestInterviewPage() {
  const [vapiClient, setVapiClient] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const initVapi = async () => {
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      
      if (!publicKey) {
        throw new Error('VAPI public key not found');
      }

      const client = new Vapi(publicKey);
      setVapiClient(client);

      // Setup event listeners
      client.on('call-start', () => {
        addLog('✅ Call started successfully');
        setIsCallActive(true);
        setError(null);
      });

      client.on('call-end', (callData) => {
        addLog(`✅ Call ended: ${JSON.stringify(callData)}`);
        setIsCallActive(false);
      });

      client.on('error', (error) => {
        addLog(`❌ VAPI error: ${JSON.stringify(error)}`);
        setError(`VAPI Error: ${JSON.stringify(error)}`);
        setIsCallActive(false);
      });

      client.on('speech-start', () => {
        addLog('🎤 User started speaking');
      });

      client.on('speech-end', () => {
        addLog('🔇 User stopped speaking');
      });

      client.on('message', (message) => {
        addLog(`💬 Message: ${JSON.stringify(message)}`);
      });

      client.on('call-failed', (error) => {
        addLog(`❌ Call failed: ${JSON.stringify(error)}`);
        setError(`Call Failed: ${JSON.stringify(error)}`);
      });

      client.on('ejected', (reason) => {
        addLog(`⚠️ Ejected: ${reason}`);
        setError(`Ejected: ${reason}`);
        setIsCallActive(false);
      });

      addLog('✅ VAPI client initialized');
      
    } catch (error) {
      addLog(`❌ Init error: ${error.message}`);
      setError(error.message);
    }
  };

  const startCall = async () => {
    if (!vapiClient) {
      setError('VAPI client not initialized');
      return;
    }

    try {
      const assistantId = '400b38ad-ae03-4124-aaa8-95bec0b518aa'; // Your assistant ID
      
      addLog(`🚀 Starting call with assistant: ${assistantId}`);
      
      await vapiClient.start(assistantId, {
        metadata: {
          test: true,
          platform: 'hireai-test'
        }
      });
      
    } catch (error) {
      addLog(`❌ Start call error: ${error.message}`);
      setError(`Start Call Error: ${error.message}`);
    }
  };

  const stopCall = async () => {
    if (vapiClient && isCallActive) {
      try {
        await vapiClient.stop();
        addLog('🛑 Call stopped manually');
      } catch (error) {
        addLog(`❌ Stop call error: ${error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">VAPI Interview Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Controls</h2>
          <div className="space-x-4">
            <button
              onClick={initVapi}
              disabled={!!vapiClient}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {vapiClient ? 'VAPI Initialized' : 'Initialize VAPI'}
            </button>
            
            <button
              onClick={startCall}
              disabled={!vapiClient || isCallActive}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isCallActive ? 'Call Active' : 'Start Test Call'}
            </button>
            
            <button
              onClick={stopCall}
              disabled={!isCallActive}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              Stop Call
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800">Error:</h3>
            <pre className="text-red-700 text-sm mt-2">{error}</pre>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Live Logs</h2>
          <div className="h-96 overflow-y-auto bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-500">No logs yet... Click Initialize VAPI to start</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}