// Vercel API Route for secure Dify API proxy
export default async function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエスト（プリフライト）への対応
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POSTリクエストのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // APIキーをサーバーサイドで直接設定（完全に隠蔽）
    const API_KEY = 'app-Oj7SUhTt1bzElA9m9wy0UEJf';
    const API_ENDPOINT = 'https://service.anddigital.co.jp/v1/workflows/run';

    if (!API_KEY) {
      console.error('DIFY_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'API configuration error' });
    }

    // クライアントからのリクエストボディを取得
    const payload = req.body;

    console.log('🚀 Proxying request to Dify API');
    console.log('📊 Request payload keys:', Object.keys(payload));
    
    // 早期レスポンス：リクエスト受信を即座に確認
    res.setHeader('X-Request-Started', Date.now());

    // タイムアウト設定を50秒に延長（Vercel制限内）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000);

    try {
      // Dify APIにリクエストを転送
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📡 Dify API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dify API Error:', response.status, errorText);
        return res.status(response.status).json({ 
          error: 'Dify API error',
          status: response.status 
        });
      }

      // レスポンスを取得してクライアントに返す
      const result = await response.json();
      console.log('✅ Dify API Success');
      
      return res.status(200).json(result);

    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('🔥 Dify API Timeout after 50 seconds');
        return res.status(504).json({ 
          error: 'Dify API timeout',
          message: 'The diagnosis process is taking longer than expected. Please try again.',
          timeout: 50000
        });
      }
      console.error('🚨 Fetch Error:', fetchError);
      return res.status(500).json({ 
        error: 'Network error',
        message: fetchError.message 
      });
    }

  } catch (error) {
    console.error('❌ Proxy Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}