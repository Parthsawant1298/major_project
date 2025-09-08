// Quick VAPI test script
const testVAPI = async () => {
  const PUBLIC_KEY = '99effca3-e9b9-4297-97ae-24666f1822c7';
  
  try {
    console.log('Testing VAPI public key...');
    
    // Import VAPI client
    const Vapi = require('@vapi-ai/web');
    const client = new Vapi(PUBLIC_KEY);
    
    console.log('VAPI client created successfully');
    
    // Try to get assistant info
    console.log('Testing assistant connection...');
    
    // Use one of your existing assistants
    const assistantId = 'a63bd20b-2ef8-46af-a63f-710be136366c';
    
    console.log('Attempting to start call...');
    await client.start(assistantId);
    
    console.log('✅ VAPI test successful!');
    
  } catch (error) {
    console.error('❌ VAPI test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      status: error.status,
      statusCode: error.statusCode
    });
  }
};

testVAPI();