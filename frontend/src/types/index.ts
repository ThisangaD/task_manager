export type Priority = 'Low' | 'Medium' | 'High';

/** Represents a single task as returned by the backend API */
export interface Task {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: Priority;
  dueDate?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a new task */
export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
}

/** Payload for updating an existing task */
export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  priority?: Priority;
  dueDate?: string;
}

/** Filter options for the task list */
export type TaskFilter = 'all' | 'completed' | 'pending';
