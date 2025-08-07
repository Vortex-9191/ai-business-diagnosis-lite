// Debug webhook response
const debugWebhook = async () => {
  const testData = new URLSearchParams({
    result: "Test result",
    workflow_run_id: "test123"
  });
  
  try {
    const response = await fetch('https://ai-business-diagnosis.vercel.app/api/webhook-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: testData
    });
    
    const html = await response.text();
    console.log('Full HTML response:');
    console.log(html);
    
    // Extract redirect URL
    const metaMatch = html.match(/content="0; url=([^"]+)"/);
    if (metaMatch) {
      console.log('\nMeta redirect URL:', metaMatch[1]);
    }
    
    const jsMatch = html.match(/window\.location\.href = '([^']+)'/);
    if (jsMatch) {
      console.log('JS redirect URL:', jsMatch[1]);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

debugWebhook();