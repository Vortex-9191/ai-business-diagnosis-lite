// Webhook Test Script
// This script simulates a Dify webhook call to test the endpoint

const testWebhook = async () => {
  console.log('🚀 Testing webhook endpoint...');
  
  // Test data similar to what Dify would send
  const testData = new URLSearchParams({
    result: `{
  "title": {
    "text": "テスト結果",
    "left": "center",
    "top": 20,
    "textStyle": { "fontSize": 22, "fontWeight": "bold" }
  },
  "radar": {
    "center": ["50%", "60%"],
    "radius": "60%",
    "indicator": [
      { "name": "AIリテラシー\\n& 期待度", "max": 5 },
      { "name": "ガバナンス・\\nリスク基盤", "max": 5 },
      { "name": "プロンプト\\n活用度", "max": 5 },
      { "name": "自動化\\nスキル", "max": 5 },
      { "name": "高度AI\\n活用", "max": 5 }
    ]
  },
  "series": [{
    "name": "テスト",
    "type": "radar",
    "data": [{
      "value": [4.2, 3.5, 4.1, 2.8, 2.3],
      "name": "テスト"
    }]
  }]
}

<hr>
<strong>1. AIリテラシー & 期待度</strong><br>
5点満点中4.2点です。
AIへの関心と業務での活用意欲は非常に高い水準にあります。

<hr>
<strong>2. ガバナンス・リスクマネジメント基盤</strong><br>
5点満点中3.5点。
生成AI利用に関するガイドラインは整備されており、適切なリスク管理ができています。

<hr>
<strong>3. プロンプト活用・業務活用度</strong><br>
5点満点中4.1点です。
プロンプト設計力は高く、効果的な業務活用ができています。`,
    workflow_run_id: `test_${Date.now()}`,
    event: 'workflow_finished'
  });
  
  try {
    const response = await fetch('https://ai-business-diagnosis.vercel.app/api/webhook-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: testData
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const responseText = await response.text();
      console.log('✅ Webhook test successful!');
      console.log('📄 Response HTML length:', responseText.length);
      console.log('🔗 Contains redirect:', responseText.includes('window.location.href'));
      
      // Extract the redirect URL from the response
      const redirectMatch = responseText.match(/window\.location\.href = '([^']+)'/);
      if (redirectMatch) {
        const redirectUrl = redirectMatch[1];
        console.log('🎯 Redirect URL:', redirectUrl);
        
        // Test if the redirect URL is valid
        try {
          const url = new URL(redirectUrl);
          console.log('✅ Redirect URL is valid');
          console.log('🔍 URL params:', url.searchParams.toString());
        } catch (e) {
          console.log('❌ Invalid redirect URL:', e.message);
        }
      }
    } else {
      console.log('❌ Webhook test failed with status:', response.status);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
};

// Test multiple webhook formats
const testAllFormats = async () => {
  console.log('🧪 Testing all webhook formats...');
  
  // Test 1: Simple result format
  await testWebhook();
  
  // Test 2: Direct URL access
  console.log('\n🔗 Testing direct URL access...');
  const testUrls = [
    'https://ai-business-diagnosis.vercel.app/?step=5&webhook_data=%7B%22result%22%3A%22Test%20result%22%7D',
    'https://ai-business-diagnosis.vercel.app/?step=5',
    'https://ai-business-diagnosis.vercel.app/api/webhook-simple'
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetch(url);
      console.log(`Status: ${response.status}`);
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }
};

// Run tests
testAllFormats();