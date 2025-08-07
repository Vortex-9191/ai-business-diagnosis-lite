export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Log everything for debugging
  console.log('=== WEBHOOK DEBUG START ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Raw body type:', typeof req.body);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('=== WEBHOOK DEBUG END ===');

  // Return detailed debug information
  const debugInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    headers: req.headers,
    body: req.body,
    bodyType: typeof req.body,
    contentType: req.headers['content-type'],
    success: true,
    message: 'Debug webhook received'
  };

  // Return JSON response
  res.status(200).json(debugInfo);
}