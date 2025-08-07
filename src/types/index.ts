export interface FormData {
  jobType: string;
  BusinessChallenge1: string;
  BusinessChallenge2: string | null;
  BusinessChallenge3: string | null;
  Q1: number | null;
  Q2: number | null;
  Q3: number | null;
  Q4: number | null;
  Q5: number | null;
  Q6: number | null;
  Q7: number | null;
  Q8: number | null;
  Q9: number | null;
  Q10: number | null;
  name: string;
  company: string;
  Yuryo: string | null;
  Muryo: string | null;
  Katsuyou: string | null;
}

export interface AIQuestion {
  id: string;
  text: string;
  category: string;
  type?: 'scale' | 'text';
}

export interface QuestionCategory {
  name: string;
  color: string;
  questions: string;
}

export interface DiagnosisResult {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: 'running' | 'succeeded' | 'failed' | 'stopped';
    outputs: {
      result: string;
      [key: string]: any;
    };
    error?: string;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  };
}

export interface BusinessUseOption {
  value: string;
  label: string;
}