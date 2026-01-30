export type Priority = 'urgent' | 'later' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  details?: string;
  tags?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: 'KHẨN',
  later: 'SAU',
  done: 'XONG',
};
