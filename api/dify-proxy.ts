import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formData } = req.body;

    // サーバーサイドでAPIキーを使用（環境変数から取得）
    const DIFY_API_KEY = process.env.DIFY_API_KEY; // REACT_APP_ プレフィックスなし
    
    console.log('🔑 Environment check:', {
      hasApiKey: !!DIFY_API_KEY,
      keyLength: DIFY_API_KEY ? DIFY_API_KEY.length : 0,
      keyPrefix: DIFY_API_KEY ? DIFY_API_KEY.substring(0, 8) + '...' : 'none'
    });
    
    if (!DIFY_API_KEY) {
      console.error('DIFY_API_KEY environment variable not set');
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'DIFY_API_KEY environment variable not configured'
      });
    }

    // Build the inputs object
    const inputs: Record<string, string> = {
      JobType: formData.jobType,
      BusinessChallenge1: formData.BusinessChallenge1,
      name: formData.name,
      company: formData.company
    };

    // Add Q1-Q35 fields
    for (let i = 1; i <= 35; i++) {
      const key = `Q${i}`;
      const value = formData[key];
      if (value !== null && value !== undefined && value !== 0) {
        inputs[key] = String(value);
      } else {
        inputs[key] = '';
      }
    }

    // Add optional fields
    if (formData.BusinessChallenge2 && formData.BusinessChallenge2.trim() !== '') {
      inputs.BusinessChallenge2 = formData.BusinessChallenge2;
    }
    if (formData.BusinessChallenge3 && formData.BusinessChallenge3.trim() !== '') {
      inputs.BusinessChallenge3 = formData.BusinessChallenge3;
    }
    
    inputs.Q36 = formData.Q36 || '';
    inputs.Q37 = formData.Q37 || '';
    inputs.Q38 = formData.Q38 || '';
    inputs.Q39 = formData.Q39 || '';
    inputs.Q40 = formData.Q40 || '';
    
    if (formData.Yuryo && formData.Yuryo.trim() !== '') {
      inputs.Yuryo = formData.Yuryo;
    }
    if (formData.Muryo && formData.Muryo.trim() !== '') {
      inputs.Muryo = formData.Muryo;
    }
    if (formData.Katsuyou && formData.Katsuyou.trim() !== '') {
      inputs.Katsuyou = formData.Katsuyou;
    }

    const payload = {
      inputs,
      response_mode: "blocking",
      user: `user_${Date.now()}`
    };

    // Dify APIにリクエスト
    console.log('🚀 Sending to Dify API:', {
      url: 'https://api.dify.ai/v1/workflows/run',
      payloadKeys: Object.keys(payload),
      inputsCount: Object.keys(inputs).length
    });
    
    const difyResponse = await fetch('https://api.dify.ai/v1/workflows/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    console.log('📡 Dify response:', {
      status: difyResponse.status,
      statusText: difyResponse.statusText,
      headers: Object.fromEntries(difyResponse.headers.entries())
    });

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text();
      console.error('Dify API Error:', errorText);
      return res.status(difyResponse.status).json({ 
        error: `Dify API error: ${difyResponse.status}`,
        details: errorText 
      });
    }

    const result = await difyResponse.json();
    console.log('Dify API Success:', result);
    
    return res.status(200).json(result);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}