export interface Student {
  id: string;
  full_name: string;
  grade: string;
  group_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuardianLinkCode {
  id: string;
  student_id: string;
  code: string;
  used_by: string | null;
  used_at: string | null;
  expires_at: string;
  created_at: string;
  student?: { full_name: string; grade: string } | null;
}

export interface CircularRead {
  id: string;
  document_id: string;
  user_id: string;
  read_at: string;
}
