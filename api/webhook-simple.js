export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    console.log('=== SIMPLE WEBHOOK RECEIVED ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Body type:', typeof req.body);
    
    // Create properly escaped data for URL
    const webhookDataString = JSON.stringify(req.body);
    const encodedData = encodeURIComponent(webhookDataString);
    const redirectUrl = `/?step=5&webhook_data=${encodedData}`;
    
    // Just redirect immediately to results page with the raw data
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Webhook Test</title>
        <meta http-equiv="refresh" content="0; url=${redirectUrl}">
        <script>
          console.log('Webhook data received:', ${JSON.stringify(req.body)});
          // Immediate redirect to app with step 5 and the webhook data
          window.location.href = '${redirectUrl}';
        </script>
      </head>
      <body>
        <h1>✅ Webhook received! Redirecting...</h1>
        <p>🔄 Redirecting to results page...</p>
        <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; font-family: monospace; font-size: 12px;">
          <strong>Received Data:</strong><br>
          <pre>${JSON.stringify(req.body, null, 2)}</pre>
        </div>
        <p>If you are not redirected automatically, <a href="${redirectUrl}">click here</a>.</p>
      </body>
      </html>
    `;
    
    res.status(200).send(html);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}