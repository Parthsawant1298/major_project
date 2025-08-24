"use client";

import { useState, useRef } from 'react';

export default function MicTestPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [logs, setLogs] = useState([]);
  const [stream, setStream] = useState(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const startMicTest = async () => {
    try {
      addLog('🎤 Requesting microphone access...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });

      addLog('✅ Microphone access granted');
      setStream(mediaStream);

      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(mediaStream);
      
      // Better analyzer settings for voice detection
      analyser.fftSize = 2048;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      analyser.smoothingTimeConstant = 0.85;
      
      microphone.connect(analyser);
      
      addLog(`📊 Audio context state: ${audioContext.state}`);
      addLog(`🎛️ Sample rate: ${audioContext.sampleRate}Hz`);
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        addLog('🔊 Audio context resumed');
      }
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      addLog('🔊 Audio context created, starting level monitoring...');
      setIsRecording(true);
      
      // Start monitoring audio levels
      monitorAudioLevel();
      
    } catch (error) {
      addLog(`❌ Microphone error: ${error.message}`);
      console.error('Microphone error:', error);
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const checkLevel = () => {
      if (!analyserRef.current || !isRecording) return;
      
      // Get time domain data (actual audio waveform)
      analyserRef.current.getByteTimeDomainData(dataArray);
      
      // Calculate RMS (Root Mean Square) for accurate audio level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128; // Normalize to -1 to 1
        sum += normalized * normalized;
      }
      
      const rms = Math.sqrt(sum / bufferLength);
      const decibels = 20 * Math.log10(rms);
      
      // Convert to percentage (0-100)
      const normalizedLevel = Math.max(0, Math.min(100, (rms * 100)));
      
      setAudioLevel(Math.round(normalizedLevel));
      
      // More sensitive logging
      if (normalizedLevel > 2) {
        addLog(`🎵 Audio: ${Math.round(normalizedLevel)}% (dB: ${decibels.toFixed(1)})`);
      }
      
      animationRef.current = requestAnimationFrame(checkLevel);
    };
    
    checkLevel();
  };

  const stopMicTest = () => {
    addLog('🛑 Stopping microphone test...');
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        addLog(`🔇 Stopped track: ${track.kind}`);
      });
      setStream(null);
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    analyserRef.current = null;
    setIsRecording(false);
    setAudioLevel(0);
    addLog('✅ Microphone test stopped');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testBasicMic = async () => {
    try {
      addLog('🔧 Testing basic microphone access...');
      
      // Test 1: Basic getUserMedia
      const stream1 = await navigator.mediaDevices.getUserMedia({ audio: true });
      addLog('✅ Basic getUserMedia works');
      
      // Test 2: Check available audio devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      addLog(`🎤 Found ${audioInputs.length} audio input devices`);
      
      audioInputs.forEach((device, index) => {
        addLog(`  ${index + 1}. ${device.label || 'Unknown Device'}`);
      });
      
      // Test 3: Check stream properties
      const audioTracks = stream1.getAudioTracks();
      addLog(`📊 Audio tracks: ${audioTracks.length}`);
      
      audioTracks.forEach((track, index) => {
        addLog(`  Track ${index + 1}: ${track.label} (enabled: ${track.enabled})`);
        addLog(`  Settings: ${JSON.stringify(track.getSettings())}`);
      });
      
      // Clean up
      stream1.getTracks().forEach(track => track.stop());
      addLog('✅ Basic mic test completed');
      
    } catch (error) {
      addLog(`❌ Basic mic test failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🎤 Microphone Test</h1>
        <p className="text-gray-600 mb-6">Test your microphone before starting the interview</p>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Microphone Controls</h2>
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={startMicTest}
              disabled={isRecording}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isRecording ? '🎤 Recording...' : '▶️ Start Mic Test'}
            </button>
            
            <button
              onClick={stopMicTest}
              disabled={!isRecording}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              ⏹️ Stop Test
            </button>
            
            <button
              onClick={clearLogs}
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
            >
              🗑️ Clear Logs
            </button>
            
            <button
              onClick={testBasicMic}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
            >
              🔧 Basic Mic Test
            </button>
          </div>

          {/* Audio Level Indicator */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Audio Level: {audioLevel}%</h3>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-100 ${
                  audioLevel > 50 ? 'bg-green-500' : 
                  audioLevel > 20 ? 'bg-yellow-500' : 
                  audioLevel > 5 ? 'bg-blue-500' : 'bg-gray-400'
                }`}
                style={{ width: `${Math.min(audioLevel, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {audioLevel > 15 ? '✅ Good audio level - mic working!' :
               audioLevel > 3 ? '⚠️ Low audio level - speak louder or check mic' :
               isRecording ? '🔇 No audio detected - check mic settings' :
               '❌ Start test to check microphone'}
            </p>
            
            {isRecording && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Troubleshooting:</strong> If you see 0% audio but your mic works in other apps:
                  <br />• Check browser mic permissions (click 🎤 icon in address bar)
                  <br />• Try refreshing the page and allowing mic access again  
                  <br />• Close other apps using microphone (Discord, Zoom, etc.)
                  <br />• Try a different browser (Chrome recommended)
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Click "Start Mic Test"</li>
              <li>Allow microphone access when prompted</li>
              <li>Speak normally - you should see audio levels</li>
              <li>If audio levels show 0%, check your microphone settings</li>
              <li>Good audio levels are 20%+ when speaking</li>
            </ol>
          </div>
        </div>

        {/* Live Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Live Logs</h2>
          <div className="h-64 overflow-y-auto bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-500">Click "Start Mic Test" to begin testing...</div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/interview/68ab266fad212663d3260a03?assistant=400b38ad-ae03-4124-aaa8-95bec0b518aa"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
          >
            🎯 Go to Interview (Test Mic First!)
          </a>
        </div>
      </div>
    </div>
  );
}