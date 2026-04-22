import axios from 'axios';
import { auth } from './firebase';
import { Task, CreateTaskPayload, UpdateTaskPayload, TaskFilter } from '@/types';

/**
 * Axios instance pre-configured with the backend base URL.
 * The request interceptor automatically attaches the Firebase ID token
 * on every request so no manual token handling is needed at call sites.
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Automatically fetch and attach the latest Firebase ID token before each call.
// Firebase tokens expire after 1 hour; getIdToken(true) auto-refreshes them.
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken(/* forceRefresh */ false);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── API Functions ────────────────────────────────────────────────────────────

export const tasksApi = {
  /** Fetch all tasks, optionally filtered by status */
  getAll: (filter: TaskFilter = 'all') =>
    apiClient.get<Task[]>(`/api/tasks?filter=${filter}`).then(r => r.data),

  /** Create a new task */
  create: (payload: CreateTaskPayload) =>
    apiClient.post<Task>('/api/tasks', payload).then(r => r.data),

  /** Update a task by ID (partial update) */
  update: (id: number, payload: UpdateTaskPayload) =>
    apiClient.put<Task>(`/api/tasks/${id}`, payload).then(r => r.data),

  /** Delete a task by ID */
  delete: (id: number) =>
    apiClient.delete(`/api/tasks/${id}`).then(r => r.data),
};
