// AI診断の自動テストスクリプト
// Node.js + Puppeteerで実行

const puppeteer = require('puppeteer');

async function testDiagnosis() {
  console.log('🚀 Starting AI Diagnosis Test...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // ブラウザを表示
    slowMo: 500 // 操作を遅くして見やすく
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. サイトにアクセス
    console.log('📍 Step 1: Accessing website...');
    await page.goto('https://ai-business-diagnosis.vercel.app');
    await page.waitForTimeout(2000);
    
    // 2. 利用規約に同意
    console.log('📍 Step 2: Agreeing to terms...');
    await page.waitForSelector('input[type="checkbox"]');
    await page.click('input[type="checkbox"]');
    await page.click('button:contains("診断を開始する")');
    await page.waitForTimeout(2000);
    
    // 3. 職種選択
    console.log('📍 Step 3: Selecting job type...');
    await page.waitForSelector('button');
    const jobButtons = await page.$$('button');
    if (jobButtons.length > 0) {
      await jobButtons[1].click(); // 2番目の職種を選択
    }
    await page.click('button:contains("次へ")');
    await page.waitForTimeout(2000);
    
    // 4. 業務課題入力
    console.log('📍 Step 4: Entering business challenge...');
    await page.waitForSelector('input, textarea');
    await page.type('input, textarea', '業務効率化とAI活用');
    await page.click('button:contains("次へ")');
    await page.waitForTimeout(2000);
    
    // 5. AI質問に回答（Q1-Q35）
    console.log('📍 Step 5: Answering AI questions...');
    for (let i = 1; i <= 35; i++) {
      console.log(`   Answering Q${i}...`);
      
      // 3番目の選択肢（真ん中）をクリック
      const buttons = await page.$$('button');
      const answerButtons = buttons.filter(async (btn) => {
        const text = await btn.evaluate(node => node.textContent);
        return text && text.includes('3') || text.includes('どちらとも');
      });
      
      if (answerButtons.length > 0) {
        await answerButtons[0].click();
        await page.waitForTimeout(300);
      }
      
      // 次の質問ボタンをクリック
      try {
        await page.click('button:contains("次の質問")');
        await page.waitForTimeout(1000);
      } catch (e) {
        console.log(`   Q${i} completed, moving to next step`);
        break;
      }
    }
    
    // 6. 自由記述質問をスキップ（Q36-Q40）
    console.log('📍 Step 6: Skipping free text questions...');
    for (let i = 0; i < 5; i++) {
      try {
        await page.click('button:contains("回答をスキップ")');
        await page.waitForTimeout(1000);
      } catch (e) {
        break;
      }
    }
    
    // 7. 個人情報入力
    console.log('📍 Step 7: Entering personal info...');
    await page.waitForSelector('input[type="text"], input[type="email"]');
    
    const inputs = await page.$$('input[type="text"], input[type="email"]');
    if (inputs.length >= 2) {
      await inputs[0].type('テストユーザー'); // 名前
      await inputs[1].type('test@example.com'); // メールアドレス
    }
    
    await page.click('button:contains("診断実行")');
    await page.waitForTimeout(3000);
    
    // 8. 診断結果を待機
    console.log('📍 Step 8: Waiting for diagnosis result...');
    await page.waitForTimeout(10000); // 10秒待機
    
    // 結果画面の確認
    const resultText = await page.evaluate(() => document.body.textContent);
    
    if (resultText.includes('診断結果') || resultText.includes('レポート') || resultText.includes('分析')) {
      console.log('✅ SUCCESS: Diagnosis completed successfully!');
      console.log('📊 Result page detected');
    } else if (resultText.includes('エラー')) {
      console.log('❌ ERROR: Error detected on result page');
    } else {
      console.log('⚠️  UNCLEAR: Could not determine result status');
    }
    
    // コンソールエラーをチェック
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    if (logs.length > 0) {
      console.log('🐛 Console Errors:');
      logs.forEach(log => console.log('   ', log));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// テスト実行
testDiagnosis().catch(console.error);