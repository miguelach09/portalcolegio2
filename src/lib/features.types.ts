export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  category: string;
  is_active: boolean;
  sort_order: number;
  status: string;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Survey {
  id: string;
  title: string;
  question: string;
  is_active: boolean;
  expires_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SurveyOption {
  id: string;
  survey_id: string;
  label: string;
  sort_order: number;
  created_at: string;
  vote_count?: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
  updated_at: string;
}
