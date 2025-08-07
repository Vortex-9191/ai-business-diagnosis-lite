import { FormData, DiagnosisResult } from '../types';
import { getSecureKey } from './keyGenerator';

// Multi-tenant configuration based on subdomain
const TENANT_CONFIGS = {
  // Default configuration (現在の設定)
  'default': {
    baseURL: 'https://service.anddigital.co.jp/v1',
    apiKey: 'app-9lSfmRYLiVcjQE2F7OBO47qS', // ライト版用APIキー
    endpoint: '/workflows/run',
    webhookUrl: 'https://ai-business-diagnosis-lite.vercel.app/api/webhook-simple'
  },
  // Company-specific configurations (API keys set via environment variables)
  'company1': {
    baseURL: 'https://api.dify.ai/v1',
    apiKey: process.env.REACT_APP_COMPANY1_API_KEY || '',
    endpoint: '/workflows/run',
    webhookUrl: 'https://company1.ai-business-diagnosis.vercel.app/api/webhook-simple'
  },
  'company2': {
    baseURL: 'https://api.dify.ai/v1',
    apiKey: process.env.REACT_APP_COMPANY2_API_KEY || '',
    endpoint: '/workflows/run',
    webhookUrl: 'https://company2.ai-business-diagnosis.vercel.app/api/webhook-simple'
  },
  'demo': {
    baseURL: 'https://api.dify.ai/v1',
    apiKey: process.env.REACT_APP_DEMO_API_KEY || '',
    endpoint: '/workflows/run',
    webhookUrl: 'https://demo.ai-business-diagnosis.vercel.app/api/webhook-simple'
  }
};

// Get configuration based on current subdomain
const getTenantConfig = () => {
  if (typeof window === 'undefined') return TENANT_CONFIGS.default;
  
  const hostname = window.location.hostname;
  // Remove sensitive logging in production
  
  // Extract subdomain (e.g., 'company1' from 'company1.ai-business-diagnosis.vercel.app')
  const subdomain = hostname.split('.')[0];
  
  // Return tenant-specific config or default
  const config = TENANT_CONFIGS[subdomain] || TENANT_CONFIGS.default;
  // Remove config logging to prevent API key exposure
  
  return config;
};

// Export function to get current webhook URL for display purposes
export const getCurrentWebhookUrl = (): string => {
  const config = getTenantConfig();
  return config.webhookUrl;
};

// Export function to get current tenant name
export const getCurrentTenant = (): string => {
  if (typeof window === 'undefined') return 'default';
  const hostname = window.location.hostname;
  return hostname.split('.')[0];
};

export const submitDiagnosis = async (formData: FormData): Promise<DiagnosisResult> => {
  // セキュアなサーバーサイドプロキシを使用
  const useProxy = true;
  
  // Build the inputs object with all fields as strings
  const inputs: Record<string, string> = {
    // Required string fields
    JobType: formData.jobType,
    BusinessChallenge1: formData.BusinessChallenge1,
    name: formData.name,
    company: formData.company
  };

  // Add required Q1-Q10 fields as strings (send numerical value only)
  for (let i = 1; i <= 10; i++) {
    const key = `Q${i}` as keyof FormData;
    const value = formData[key];
    if (value !== null && value !== undefined && value !== 0) {
      inputs[`Q${i}`] = String(value);
    } else {
      inputs[`Q${i}`] = '';
    }
  }

  // Add optional string fields if they have non-empty values
  if (formData.BusinessChallenge2 && formData.BusinessChallenge2.trim() !== '') {
    inputs.BusinessChallenge2 = formData.BusinessChallenge2;
  }
  if (formData.BusinessChallenge3 && formData.BusinessChallenge3.trim() !== '') {
    inputs.BusinessChallenge3 = formData.BusinessChallenge3;
  }
  
  // Q36-Q40 are also required by Dify
  inputs.Q36 = formData.Q36 || '';
  inputs.Q37 = formData.Q37 || '';
  inputs.Q38 = formData.Q38 || '';
  inputs.Q39 = formData.Q39 || '';
  inputs.Q40 = formData.Q40 || '';
  
  // Other optional fields
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

  try {
    let response;
    
    if (useProxy) {
      // セキュアなサーバーサイドプロキシを使用
      console.log('🚀 Sending request via secure proxy');
      console.log('📊 Request payload keys:', Object.keys(payload));
      
      try {
        response = await fetch('/api/diagnosis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        
        // 504エラーの場合は直接接続にフォールバック
        if (response.status === 504) {
          console.log('⚠️ Proxy timeout, falling back to direct connection');
          const config = getTenantConfig();
          
          if (config.apiKey) {
            const requestUrl = `${config.baseURL}${config.endpoint}`;
            response = await fetch(requestUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload)
            });
          }
        }
      } catch (proxyError) {
        console.log('⚠️ Proxy failed, falling back to direct connection');
        // プロキシ失敗時は直接接続にフォールバック
        const config = getTenantConfig();
        
        if (config.apiKey) {
          const requestUrl = `${config.baseURL}${config.endpoint}`;
          response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });
        } else {
          throw proxyError;
        }
      }
    } else {
      // 直接接続（フォールバック）
      const config = getTenantConfig();
      
      console.log('🔑 API Key status:', {
        hasKey: !!config.apiKey,
        keyLength: config.apiKey?.length || 0,
        keyPrefix: config.apiKey?.substring(0, 10) || 'none'
      });
      
      if (!config.apiKey) {
        throw new Error('API key is not configured.');
      }
      
      const requestUrl = `${config.baseURL}${config.endpoint}`;
      console.log('🚀 Sending request to Dify API (direct)');
      console.log('📊 Request payload keys:', Object.keys(payload));
      
      response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
    }

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      // デバッグ用：詳細なエラー情報を表示
      console.error('Dify API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        url: response.url
      });
      throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
    }

    const result = await response.json();
    // Remove sensitive response logging in production
    console.log('Dify API Success - Response received');
    
    return result;
  } catch (error) {
    console.error('❌ Dify API Error Details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      type: typeof error,
      error: error
    });
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 Network error detected - check CORS, internet connection, or API endpoint');
      throw new Error('ネットワーク接続でエラーが発生しました');
    }
    
    // その他のエラーもユーザーフレンドリーに
    throw new Error('診断の処理中にエラーが発生しました');
  }
};