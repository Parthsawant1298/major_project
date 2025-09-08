// Test script to verify the entire interview system
const testInterviewSystem = async () => {
  const BASE_URL = 'http://localhost:3000';
  const JOB_ID = '68b72d8cb649c5fb2b9dee24';
  
  console.log('🧪 Testing Interview System...\n');
  
  try {
    // Test 1: Create interview assistant
    console.log('1️⃣ Testing interview assistant creation...');
    const assistantResponse = await fetch(`${BASE_URL}/api/interview/create-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: JOB_ID })
    });
    
    const assistantResult = await assistantResponse.json();
    
    if (assistantResult.success) {
      console.log(`✅ Assistant created: ${assistantResult.assistantId}`);
      console.log(`📋 Job: ${assistantResult.jobTitle} (${assistantResult.questionsCount} questions)\n`);
      
      // Test 2: Create web call
      console.log('2️⃣ Testing web call creation...');
      const callResponse = await fetch(`${BASE_URL}/api/interview/start-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: assistantResult.assistantId,
          metadata: {
            jobId: JOB_ID,
            userName: 'Test User',
            jobTitle: assistantResult.jobTitle,
            platform: 'hireai-test'
          }
        })
      });
      
      const callResult = await callResponse.json();
      
      if (callResult.success) {
        console.log(`✅ Web call created: ${callResult.call.id}`);
        console.log(`🔗 Interview URL: ${callResult.webCallUrl}\n`);
        console.log('🎉 INTERVIEW SYSTEM TEST SUCCESSFUL!');
        console.log(`\n🎯 Ready to test: ${BASE_URL}/interview/${JOB_ID}`);
      } else {
        console.error('❌ Web call creation failed:', callResult.error);
      }
    } else {
      console.error('❌ Assistant creation failed:', assistantResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testInterviewSystem();