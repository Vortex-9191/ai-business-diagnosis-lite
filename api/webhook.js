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

  // Handle POST requests for webhook
  if (req.method === 'POST') {
    try {
      let data;
      
      // Handle different content types
      const contentType = req.headers['content-type'] || '';
      
      if (contentType.includes('application/x-www-form-urlencoded')) {
        // Parse form data - req.body is already parsed by Vercel
        data = req.body;
        console.log('📨 Webhook received (form-encoded):', data);
        
        // If it's still a string, try to parse as URLSearchParams
        if (typeof data === 'string') {
          const urlParams = new URLSearchParams(data);
          const formData = {};
          for (const [key, value] of urlParams) {
            formData[key] = value;
          }
          data = formData;
          console.log('📨 Parsed form data:', data);
        }
      } else if (contentType.includes('application/json')) {
        // Parse JSON data
        data = req.body;
        console.log('📨 Webhook received (JSON):', data);
      } else {
        // Default to body as-is
        data = req.body;
        console.log('📨 Webhook received (raw):', data);
      }

      // Format the result data properly for Dify form-encoded webhook
      const resultData = {
        workflow_run_id: data.workflow_run_id || 'webhook_' + Date.now(),
        task_id: data.workflow_run_id || 'task_' + Date.now(),
        data: {
          id: data.workflow_run_id || 'result_' + Date.now(),
          workflow_id: data.workflow_run_id || '',
          status: 'succeeded',
          outputs: {
            result: data.result || data.output || JSON.stringify(data)
          },
          elapsed_time: 2000,
          total_tokens: 800,
          total_steps: 1,
          created_at: Date.now(),
          finished_at: Date.now()
        }
      };

      // Return HTML page that immediately redirects with the result
      const redirectHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>AI Analysis Complete</title>
          <meta http-equiv="refresh" content="0; url=/?step=5&result=${encodeURIComponent(JSON.stringify(resultData))}">
          <script>
            // Immediate redirect with result data
            const resultData = ${JSON.stringify(resultData)};
            console.log('📨 Webhook received, redirecting with result:', resultData);
            
            // Store result in localStorage as backup
            try {
              localStorage.setItem('dify_webhook_result', JSON.stringify(resultData));
              console.log('💾 Result stored in localStorage');
            } catch (e) {
              console.error('Storage error:', e);
            }
            
            // Immediate redirect
            const redirectUrl = '/?step=5&result=' + encodeURIComponent(JSON.stringify(resultData));
            window.location.href = redirectUrl;
          </script>
        </head>
        <body>
          <h2>🤖 AI Analysis Complete!</h2>
          <p>✅ Redirecting to results...</p>
          <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; font-family: monospace; font-size: 12px;">
            <strong>Webhook Data:</strong><br>
            <pre>${JSON.stringify(data, null, 2)}</pre>
          </div>
          <p>If you are not redirected automatically, <a href="/?step=5&result=${encodeURIComponent(JSON.stringify(resultData))}">click here</a>.</p>
        </body>
        </html>
      `;

      res.status(200).send(redirectHTML);
    } catch (error) {
      console.error('❌ Webhook error:', error);
      res.status(400).json({
        success: false,
        error: 'Invalid request'
      });
    }
    return;
  }

  // Handle other methods
  res.status(405).json({
    error: 'Method not allowed'
  });
}