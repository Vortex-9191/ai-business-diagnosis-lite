exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Handle POST requests for webhook
  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      console.log('📨 Webhook received:', data);

      // Process the webhook data here
      // For now, just return success
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Webhook received successfully',
          data: data
        }),
      };
    } catch (error) {
      console.error('❌ Webhook error:', error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid JSON payload'
        }),
      };
    }
  }

  // Handle other methods
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({
      error: 'Method not allowed'
    }),
  };
};