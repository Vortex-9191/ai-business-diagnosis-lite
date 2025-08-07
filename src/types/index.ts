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
  Q11: number | null;
  Q12: number | null;
  Q13: number | null;
  Q14: number | null;
  Q15: number | null;
  Q16: number | null;
  Q17: number | null;
  Q18: number | null;
  Q19: number | null;
  Q20: number | null;
  Q21: number | null;
  Q22: number | null;
  Q23: number | null;
  Q24: number | null;
  Q25: number | null;
  Q26: number | null;
  Q27: number | null;
  Q28: number | null;
  Q29: number | null;
  Q30: number | null;
  Q31: number | null;
  Q32: number | null;
  Q33: number | null;
  Q34: number | null;
  Q35: number | null;
  Q36: string | null;
  Q37: string | null;
  Q38: string | null;
  Q39: string | null;
  Q40: string | null;
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