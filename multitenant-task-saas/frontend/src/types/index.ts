export type Role = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER' | 'VIEWER';

export interface AuthUser {
  userId: string;
  tenantId: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  users: Array<{ id: string; name: string; email: string; memberships: Array<{ role: Role }> }>;
  projects: Array<{ id: string; name: string; description?: string }>;
  subscriptions: Array<{ plan: string }>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  boards: Array<{ id: string; name: string }>;
}

export interface Column {
  id: string;
  name: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  position: number;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  labels: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate?: string;
  position: number;
  assignee?: { id: string; name: string };
  assigneeId?: string;
  columnId: string;
  comments: Comment[];
  activityLogs: Array<{ id: string; action: string; createdAt: string }>;
}

export interface BoardData {
  id: string;
  name: string;
  project: { id: string; name: string; description?: string };
  columns: Column[];
  tasks: Task[];
}
