export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Log everything for debugging
  console.log('=== WEBHOOK MONITOR ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));
  console.log('========================');

  if (req.method === 'POST') {
    // Process webhook and immediately show success page with redirect
    const webhookData = req.body;
    const testUrl = `/?step=5&webhook_data=${encodeURIComponent(JSON.stringify(webhookData))}`;
    
    res.status(200).json({
      success: true,
      message: 'Webhook received successfully',
      timestamp: new Date().toISOString(),
      data: webhookData,
      redirectUrl: testUrl,
      instructions: {
        step1: 'Webhook data logged to Vercel console',
        step2: `Visit this URL to test results: ${testUrl}`,
        step3: 'Check Vercel function logs for detailed webhook data'
      }
    });
    return;
  }

  // GET request - show monitor status
  res.status(200).json({
    status: 'Webhook monitor active',
    timestamp: new Date().toISOString(),
    endpoint: '/api/webhook-monitor',
    instructions: {
      setup: 'Set this URL as your Dify webhook endpoint',
      format: 'POST with application/x-www-form-urlencoded',
      check: 'Monitor Vercel function logs for webhook reception'
    }
  });
}