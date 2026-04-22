/** Represents a single task as returned by the backend API */
export interface Task {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a new task */
export interface CreateTaskPayload {
  title: string;
  description?: string;
}

/** Payload for updating an existing task */
export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  isCompleted?: boolean;
}

/** Filter options for the task list */
export type TaskFilter = 'all' | 'completed' | 'pending';
