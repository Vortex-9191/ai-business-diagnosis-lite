export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Return debug page that shows real-time webhook data
  const debugPage = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Webhook Debug Monitor</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .webhook-log { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 15px; margin: 10px 0; }
        .timestamp { color: #666; font-size: 12px; }
        .data { background: #e9ecef; padding: 10px; margin: 5px 0; border-radius: 4px; font-family: monospace; white-space: pre-wrap; }
        .status { padding: 5px 10px; border-radius: 4px; color: white; font-weight: bold; }
        .success { background: #28a745; }
        .error { background: #dc3545; }
        .info { background: #17a2b8; }
        .test-btn { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; }
        .test-btn:hover { background: #0056b3; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔍 Webhook Debug Monitor</h1>
        <p>このページではWebhookの受信をリアルタイムで監視できます。</p>
        
        <div class="webhook-log">
          <div class="status info">Monitor Active</div>
          <div class="timestamp">Started: ${new Date().toISOString()}</div>
          <div>Webhook URL: <strong>https://ai-business-diagnosis.vercel.app/api/debug</strong></div>
        </div>

        <h2>📊 Test Buttons</h2>
        <button class="test-btn" onclick="testWebhook()">Test Webhook POST</button>
        <button class="test-btn" onclick="testDirectURL()">Test Direct Results URL</button>
        <button class="test-btn" onclick="clearLogs()">Clear Logs</button>

        <h2>📝 Received Webhooks</h2>
        <div id="webhookLogs"></div>

        <h2>📋 Instructions</h2>
        <ol>
          <li><strong>Dify設定:</strong> Webhook URLを <code>https://ai-business-diagnosis.vercel.app/api/debug</code> に設定</li>
          <li><strong>診断実行:</strong> フォームから診断を送信</li>
          <li><strong>確認:</strong> ここにWebhookデータが表示されるかチェック</li>
          <li><strong>問題特定:</strong> データが来ない場合はDify側の設定を確認</li>
        </ol>
      </div>

      <script>
        let webhookCount = 0;

        function addLog(type, message, data = null) {
          const logsDiv = document.getElementById('webhookLogs');
          const logDiv = document.createElement('div');
          logDiv.className = 'webhook-log';
          
          let content = \`
            <div class="status \${type}">\${type.toUpperCase()}</div>
            <div class="timestamp">\${new Date().toISOString()}</div>
            <div>\${message}</div>
          \`;
          
          if (data) {
            content += \`<div class="data">\${JSON.stringify(data, null, 2)}</div>\`;
          }
          
          logDiv.innerHTML = content;
          logsDiv.insertBefore(logDiv, logsDiv.firstChild);
        }

        function testWebhook() {
          addLog('info', 'Testing webhook endpoint...', null);
          
          const testData = new URLSearchParams({
            result: 'Test webhook from debug page',
            workflow_run_id: 'debug_test_' + Date.now(),
            event: 'workflow_finished'
          });

          fetch('/api/webhook-simple', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: testData
          })
          .then(response => {
            if (response.ok) {
              addLog('success', 'Webhook test successful', { status: response.status });
            } else {
              addLog('error', 'Webhook test failed', { status: response.status });
            }
          })
          .catch(error => {
            addLog('error', 'Webhook test error', { error: error.message });
          });
        }

        function testDirectURL() {
          const testUrl = '/?step=5&webhook_data=' + encodeURIComponent(JSON.stringify({
            result: 'Debug test result',
            workflow_run_id: 'debug_' + Date.now()
          }));
          
          addLog('info', 'Opening test results URL...', { url: testUrl });
          window.open(testUrl, '_blank');
        }

        function clearLogs() {
          document.getElementById('webhookLogs').innerHTML = '';
          addLog('info', 'Logs cleared');
        }

        // Poll for webhook data in localStorage
        setInterval(() => {
          const stored = localStorage.getItem('dify_webhook_result');
          if (stored) {
            try {
              const data = JSON.parse(stored);
              addLog('success', 'Found webhook data in localStorage!', data);
              localStorage.removeItem('dify_webhook_result');
            } catch (e) {
              addLog('error', 'Invalid webhook data in localStorage', { error: e.message });
            }
          }
        }, 2000);

        // Initial log
        addLog('info', 'Debug monitor started');
      </script>
    </body>
    </html>
  `;

  res.status(200).send(debugPage);
}