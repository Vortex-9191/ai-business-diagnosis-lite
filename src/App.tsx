import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import StepIndicator from './components/StepIndicator';
import JobTypeSelection from './components/JobTypeSelection';
import BusinessChallengeForm from './components/BusinessChallengeForm';
import AIQuestionsForm from './components/AIQuestionsForm';
import PersonalInfoForm from './components/PersonalInfoForm';
import ResultsDisplay from './components/ResultsDisplay';
import AnalysisLoading from './components/AnalysisLoading';
import SimpleAnalysisLoading from './components/SimpleAnalysisLoading';
import TermsAgreement from './components/TermsAgreement';
import { submitDiagnosis, getCurrentWebhookUrl, getCurrentTenant } from './utils/difyApi';
import { useWebhookReceiver } from './hooks/useWebhookReceiver';
import { FormData } from './types';

const STORAGE_KEY = 'ai-diagnosis-form-data';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Webhook受信フック
  const { 
    webhookResult, 
    isWaitingForWebhook, 
    startWaitingForWebhook, 
    clearWebhookResult,
    getWebhookUrl,
    setIsWaitingForWebhook
  } = useWebhookReceiver();

  const [formData, setFormData] = useState<Partial<FormData>>({
    jobType: '',
    BusinessChallenge1: '',
    BusinessChallenge2: '',
    BusinessChallenge3: '',
    Q1: null, Q2: null, Q3: null, Q4: null, Q5: null, Q6: null, Q7: null, Q8: null, Q9: null, Q10: null,
    Q36: '', Q37: '', Q38: '', Q39: '', Q40: '',
    name: '',
    company: '',
    Yuryo: '',
    Muryo: '',
    Katsuyou: ''
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsStep, setShowTermsStep] = useState(true);

  // Webhook結果を監視（最優先）
  useEffect(() => {
    if (webhookResult) {
      console.log('🎯 Webhook result received in App (PRIORITY):', webhookResult);
      console.log('🎯 Webhook result type:', typeof webhookResult);
      console.log('🎯 Webhook result keys:', Object.keys(webhookResult));
      
      // Webhookの結果を最優先で使用
      setResults(webhookResult);
      setCurrentStep(5);
      setIsLoading(false);
      setIsWaitingForWebhook(false);
      localStorage.removeItem(STORAGE_KEY);
      
      console.log('✅ Webhook result processed successfully');
    }
  }, [webhookResult]);

  // LocalStorageを直接監視（追加の安全策）
  useEffect(() => {
    if (isWaitingForWebhook) {
      console.log('🔍 Starting aggressive polling for webhook result...');
      
      const checkInterval = setInterval(() => {
        const stored = localStorage.getItem('dify_webhook_result');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            console.log('🎯 Direct LocalStorage check found result:', parsed);
            setResults(parsed);
            setCurrentStep(5);
            setIsLoading(false);
            setIsWaitingForWebhook(false);
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem('dify_webhook_result');
          } catch (error) {
            console.error('Error parsing stored result:', error);
          }
        }
      }, 500); // 0.5秒ごとにチェック（より頻繁に）

      // タイムアウトハンドリング
      const timeoutCheck = setTimeout(() => {
        console.log('⏰ Webhook timeout reached, checking for any stored results...');
        const stored = localStorage.getItem('dify_webhook_result');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            console.log('🎯 Found result during timeout check:', parsed);
            setResults(parsed);
            setCurrentStep(5);
            setIsLoading(false);
            setIsWaitingForWebhook(false);
            localStorage.removeItem('dify_webhook_result');
          } catch (error) {
            console.error('Error parsing timeout result:', error);
          }
        }
      }, 30000); // 30秒でタイムアウト

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeoutCheck);
      };
    }
  }, [isWaitingForWebhook]);

  // Local Storage からデータを復元
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }

    // Webhook結果の即座チェック（アプリ起動時）
    const checkWebhookResult = () => {
      const webhookData = localStorage.getItem('dify_webhook_result');
      if (webhookData) {
        try {
          const parsed = JSON.parse(webhookData);
          console.log('🚀 Found webhook result on app start:', parsed);
          setResults(parsed);
          setCurrentStep(5);
          setIsLoading(false);
          localStorage.removeItem('dify_webhook_result');
          localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
          console.error('Error parsing webhook result on start:', error);
        }
      }
    };

    checkWebhookResult();

    // ページフォーカス時の自動チェック
    const handleFocus = () => {
      console.log('🔍 Page focused, checking for webhook results...');
      checkWebhookResult();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // URL パラメータからWebhook データを受信（シンプル形式）
  useEffect(() => {
    console.log('🔍 Checking URL parameters on mount...');
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    const webhookDataParam = urlParams.get('webhook_data');
    const resultParam = urlParams.get('result');
    const webhookParam = urlParams.get('webhook');
    const dataParam = urlParams.get('data');
    
    console.log('🔍 URL Parameters:', {
      step: stepParam,
      webhook_data: webhookDataParam ? 'present' : 'missing',
      result: resultParam ? 'present' : 'missing',
      webhook: webhookParam,
      data: dataParam ? 'present' : 'missing'
    });
    
    // 最新のシンプル形式: ?step=5&webhook_data=...
    if (stepParam === '5' && webhookDataParam) {
      console.log('🎯 Processing simple webhook data from URL...');
      try {
        const webhookData = JSON.parse(decodeURIComponent(webhookDataParam));
        console.log('🎯 Simple webhook data from URL:', webhookData);
        
        // Convert raw webhook data to expected format
        const processedResult = {
          workflow_run_id: webhookData.workflow_run_id || `webhook_${Date.now()}`,
          task_id: webhookData.workflow_run_id || `task_${Date.now()}`,
          data: {
            id: webhookData.workflow_run_id || `result_${Date.now()}`,
            workflow_id: webhookData.workflow_run_id || '',
            status: 'succeeded',
            outputs: {
              result: webhookData.result || webhookData.output || JSON.stringify(webhookData)
            },
            elapsed_time: 2000,
            total_tokens: 800,
            total_steps: 1,
            created_at: Date.now(),
            finished_at: Date.now()
          }
        };
        
        console.log('✅ Setting results and transitioning to step 5:', processedResult);
        setResults(processedResult);
        setCurrentStep(5);
        setIsLoading(false);
        setIsWaitingForWebhook(false);
        localStorage.removeItem(STORAGE_KEY);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      } catch (error) {
        console.error('❌ Failed to parse simple webhook data from URL:', error);
      }
    } else if (stepParam === '5') {
      console.log('🎯 Step 5 requested but no webhook data, going to step 5 anyway');
      setCurrentStep(5);
      setIsLoading(false);
      setIsWaitingForWebhook(false);
    }
    
    // 中間形式: ?step=5&result=...
    if (stepParam === '5' && resultParam) {
      try {
        const resultData = JSON.parse(decodeURIComponent(resultParam));
        console.log('🎯 Direct webhook result from URL:', resultData);
        
        setResults(resultData);
        setCurrentStep(5);
        setIsLoading(false);
        setIsWaitingForWebhook(false);
        localStorage.removeItem(STORAGE_KEY);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      } catch (error) {
        console.error('Failed to parse direct webhook result from URL:', error);
      }
    }
    
    // 旧形式のサポート: ?webhook=received&data=...
    if (webhookParam === 'received' && dataParam) {
      try {
        const webhookData = JSON.parse(decodeURIComponent(dataParam));
        console.log('🎯 Legacy webhook data from URL:', webhookData);
        
        // Process the webhook data
        const processedResult = {
          workflow_run_id: webhookData.workflow_run_id || `webhook_${Date.now()}`,
          task_id: webhookData.data?.id || `task_${Date.now()}`,
          data: {
            id: webhookData.data?.id || `result_${Date.now()}`,
            workflow_id: webhookData.data?.workflow_id || webhookData.workflow_run_id || '',
            status: webhookData.data?.status || 'succeeded',
            outputs: webhookData.data?.outputs || { 
              result: webhookData.result || webhookData.text || JSON.stringify(webhookData)
            },
            error: webhookData.data?.error,
            elapsed_time: webhookData.data?.elapsed_time || 0,
            total_tokens: webhookData.data?.total_tokens || 0,
            total_steps: webhookData.data?.total_steps || 0,
            created_at: webhookData.data?.created_at || Date.now(),
            finished_at: webhookData.data?.finished_at || Date.now()
          }
        };
        
        setResults(processedResult);
        setCurrentStep(5);
        setIsLoading(false);
        setIsWaitingForWebhook(false);
        localStorage.removeItem(STORAGE_KEY);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Failed to parse legacy webhook data from URL:', error);
      }
    }
  }, []);

  // フォームデータが変更されたら Local Storage に保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.jobType) {
          newErrors.jobType = '職種を選択してください';
        }
        break;
      case 2:
        if (!formData.BusinessChallenge1) {
          newErrors.BusinessChallenge1 = '最も時間がかかっている業務課題を入力してください';
        }
        break;
      case 3:
        // Q1-Q35の数値質問の検証（すべて必須）
        for (let i = 1; i <= 35; i++) {
          const key = `Q${i}` as keyof FormData;
          if (!formData[key] || formData[key] === null) {
            newErrors[key] = `Q${i}に回答してください`;
            break; // 最初のエラーのみ表示
          }
        }
        break;
      case 4:
        if (!formData.name?.trim()) {
          newErrors.name = '名前を入力してください';
        }
        if (!formData.company?.trim()) {
          newErrors.company = 'メールアドレスを入力してください';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsLoading(true);
    
    try {
      console.log('🚀 Starting diagnosis submission...');
      
      // 即座に分析中画面に移行
      setCurrentStep(4.5);
      setIsLoading(false);
      
      // Webhook待機を開始
      startWaitingForWebhook();
      
      // Dify APIに送信（成功時は結果を保存、失敗時はWebhookに完全依存）
      let apiResult = null;
      try {
        apiResult = await submitDiagnosis(formData as FormData);
        console.log('📤 Dify API response successful:', apiResult);
      } catch (apiError) {
        console.log('📤 Dify API failed, relying completely on webhook:', apiError.message);
        // API失敗時はWebhookにのみ依存
      }
      
      // Webhookを待機中であることをユーザーに表示
      console.log('⏳ Waiting for Dify webhook result (primary source)...');
      
      // Webhook結果を待機（APIが成功した場合のみフォールバック）
      const timeout = setTimeout(() => {
        console.log('⏰ Webhook timeout reached');
        
        if (apiResult) {
          console.log('📋 Using API result as fallback:', apiResult);
          setResults(apiResult);
          setCurrentStep(5);
          setIsLoading(false);
          setIsWaitingForWebhook(false);
        } else {
          console.log('❌ No API result available, showing error');
          setIsLoading(false);
          setIsWaitingForWebhook(false);
          alert('診断の処理中にエラーが発生しました。しばらく時間をおいてから再度お試しください。');
        }
      }, 15000); // 15秒に延長してWebhookを優先

      // Webhook受信時にタイムアウトをクリア
      if (webhookResult) {
        clearTimeout(timeout);
        console.log('🎯 Webhook received, clearing timeout');
      }

    } catch (error) {
      console.error('❌ Submission error:', error);
      setIsLoading(false);
      setIsWaitingForWebhook(false);
      alert('診断の処理中にエラーが発生しました。しばらく時間をおいてから再度お試しください。');
    }
  };

  const handleRestart = () => {
    setFormData({
      jobType: '',
      BusinessChallenge1: '',
      BusinessChallenge2: '',
      BusinessChallenge3: '',
      Q1: null, Q2: null, Q3: null, Q4: null, Q5: null, Q6: null, Q7: null, Q8: null, Q9: null, Q10: null,
      Q11: null, Q12: null, Q13: null, Q14: null, Q15: null, Q16: null, Q17: null, Q18: null, Q19: null, Q20: null,
      Q21: null, Q22: null, Q23: null, Q24: null, Q25: null, Q26: null, Q27: null, Q28: null, Q29: null, Q30: null,
      Q31: null, Q32: null, Q33: null, Q34: null, Q35: null,
      Q36: '', Q37: '', Q38: '', Q39: '', Q40: '',
      name: '',
      company: '',
      Yuryo: '',
      Muryo: '',
      Katsuyou: ''
    });
    setResults(null);
    setCurrentStep(1);
    setErrors({});
    setAgreedToTerms(false);
    setShowTermsStep(true);
    clearWebhookResult();
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleStartDiagnosis = () => {
    setShowTermsStep(false);
    setCurrentStep(1);
  };

  const renderCurrentStep = () => {
    if (showTermsStep) {
      return (
        <TermsAgreement
          agreed={agreedToTerms}
          onAgreementChange={setAgreedToTerms}
          onStart={handleStartDiagnosis}
        />
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <JobTypeSelection
            selectedJobType={formData.jobType || ''}
            onJobTypeChange={(jobType) => updateFormData('jobType', jobType)}
          />
        );
      case 2:
        return (
          <BusinessChallengeForm
            selectedJobType={formData.jobType || ''}
            challenges={{
              BusinessChallenge1: formData.BusinessChallenge1 || '',
              BusinessChallenge2: formData.BusinessChallenge2 || '',
              BusinessChallenge3: formData.BusinessChallenge3 || ''
            }}
            onChallengeUpdate={updateFormData}
          />
        );
      case 3:
        return (
          <AIQuestionsForm
            formData={formData}
            onAnswerChange={updateFormData}
          />
        );
      case 4:
        return (
          <PersonalInfoForm
            formData={{
              name: formData.name || '',
              company: formData.company || '',
              Yuryo: formData.Yuryo || '',
              Muryo: formData.Muryo || '',
              Katsuyou: formData.Katsuyou || ''
            }}
            onInfoChange={updateFormData}
          />
        );
      case 4.5:
        return <AnalysisLoading />;
      case 5:
        return (
          <ResultsDisplay
            results={results}
            onRestart={handleRestart}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            {/* ロゴ画像 */}
            <div className="inline-flex items-center justify-center">
              <img 
                src="/screenshot-2025-06-18-15-32-55.png" 
                alt="AI ビジネス診断" 
                className="h-12 sm:h-16 md:h-20 w-auto"
              />
            </div>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-2">
            あなたのAI活用レベルを診断し、最適な改善提案をお届けします
          </p>
        </div>

        {/* ステップインジケーター */}
        {!showTermsStep && currentStep <= 4 && (
          <StepIndicator currentStep={currentStep} totalSteps={4} />
        )}


        {/* メインコンテンツ */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 p-4 sm:p-6 md:p-8 min-h-[400px] sm:min-h-[600px]">
            {renderCurrentStep()}

            {/* エラー表示 */}
            {Object.keys(errors).length > 0 && (
              <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
                <h4 className="text-red-800 font-semibold mb-3 flex items-center">
                  <span className="w-5 h-5 bg-red-500 rounded-full mr-2 flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </span>
                  入力エラー
                </h4>
                <ul className="text-red-700 text-sm space-y-2">
                  {Object.values(errors).map((error, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-3"></span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ナビゲーションボタン */}
          {!showTermsStep && currentStep <= 4 && currentStep !== 4.5 && (
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-8">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`
                  flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 font-semibold rounded-xl sm:rounded-2xl transition-all duration-300 transform text-sm sm:text-base
                  ${currentStep === 1
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:shadow-lg hover:scale-105'
                  }
                `}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                戻る
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-[#59B3B3] text-white font-semibold rounded-xl sm:rounded-2xl hover:bg-[#4A9999] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  次へ
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || isWaitingForWebhook}
                  className={`
                    flex items-center justify-center px-8 sm:px-10 py-3 sm:py-4 font-semibold rounded-xl sm:rounded-2xl transition-all duration-300 transform shadow-lg text-sm sm:text-base
                    ${isLoading || isWaitingForWebhook
                      ? 'bg-slate-400 text-white cursor-not-allowed'
                      : 'bg-[#59B3B3] text-white hover:bg-[#4A9999] hover:scale-105 hover:shadow-xl'
                    }
                  `}
                >
                  {isLoading || isWaitingForWebhook ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      {isWaitingForWebhook ? 'AI分析中...' : '送信中...'}
                    </>
                  ) : (
                    '診断実行'
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* フッター */}
        <footer className="text-center mt-16 text-slate-500 text-sm">
          <div className="w-full h-px bg-slate-200 mb-6"></div>
          <p>©2025 anddigital Co.,Ltd</p>
        </footer>
      </div>
    </div>
  );
}

export default App;