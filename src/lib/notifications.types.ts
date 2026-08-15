export type NotificationAudience = "all" | "grade" | "student";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  link: string | null;
  audience: NotificationAudience;
  grade: string | null;
  student_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyNotification extends AppNotification {
  is_read: boolean;
  student_name: string | null;
}

export interface AdminNotification extends AppNotification {
  reads: number;
  student_name: string | null;
}
