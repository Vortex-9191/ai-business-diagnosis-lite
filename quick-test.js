// 簡単なAPI接続テスト
const testData = {
  inputs: {
    JobType: "経営者・役員",
    BusinessChallenge1: "業務効率化",
    name: "テストユーザー",
    company: "test@example.com",
    Q1: "3", Q2: "3", Q3: "3", Q4: "3", Q5: "3",
    Q6: "3", Q7: "3", Q8: "3", Q9: "3", Q10: "3",
    Q11: "3", Q12: "3", Q13: "3", Q14: "3", Q15: "3",
    Q16: "3", Q17: "3", Q18: "3", Q19: "3", Q20: "3",
    Q21: "3", Q22: "3", Q23: "3", Q24: "3", Q25: "3",
    Q26: "3", Q27: "3", Q28: "3", Q29: "3", Q30: "3",
    Q31: "3", Q32: "3", Q33: "3", Q34: "3", Q35: "3",
    Q36: "", Q37: "", Q38: "", Q39: "", Q40: ""
  },
  response_mode: "blocking",
  user: "test_user"
};

async function quickTest() {
  try {
    console.log('🚀 Testing API connection...');
    
    const response = await fetch('https://service.anddigital.co.jp/v1/workflows/run', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer app-Oj7SUhTt1bzElA9m9wy0UEJf',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCESS: API is working!');
      console.log('📊 Response keys:', Object.keys(result));
    } else {
      const error = await response.text();
      console.log('❌ ERROR:', response.status, error);
    }
    
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error.message);
  }
}

quickTest();