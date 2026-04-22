import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '@/lib/api';
import { Task, CreateTaskPayload, UpdateTaskPayload, TaskFilter } from '@/types';
import toast from 'react-hot-toast';

/**
 * Custom hook that encapsulates all task state and CRUD operations.
 * Components consume this hook and never call the API directly —
 * this keeps API logic in one place and components focused on rendering.
 */
export function useTasks(filter: TaskFilter = 'all') {
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // ─── Fetch tasks from API ───────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksApi.getAll(filter);
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      toast.error('Could not load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ─── Create task ────────────────────────────────────────────────────────────
  const createTask = async (payload: CreateTaskPayload) => {
    try {
      const newTask = await tasksApi.create(payload);
      setTasks(prev => [newTask, ...prev]); // Optimistic: prepend new task
      toast.success('Task created!');
    } catch {
      toast.error('Failed to create task.');
    }
  };

  // ─── Toggle completion ──────────────────────────────────────────────────────
  const toggleTask = async (id: number, isCompleted: boolean) => {
    // Optimistic update: update UI instantly, then sync to server
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted } : t));
    try {
      await tasksApi.update(id, { isCompleted });
    } catch {
      // Rollback on failure
      setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !isCompleted } : t));
      toast.error('Failed to update task.');
    }
  };

  // ─── Update task ────────────────────────────────────────────────────────────
  const updateTask = async (id: number, payload: UpdateTaskPayload) => {
    try {
      const updated = await tasksApi.update(id, payload);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      toast.success('Task updated!');
    } catch {
      toast.error('Failed to update task.');
    }
  };

  // ─── Delete task ────────────────────────────────────────────────────────────
  const deleteTask = async (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id)); // Optimistic remove
    try {
      await tasksApi.delete(id);
      toast.success('Task deleted.');
    } catch {
      toast.error('Failed to delete task.');
      fetchTasks(); // Refetch to restore state on failure
    }
  };

  return { tasks, loading, error, createTask, toggleTask, updateTask, deleteTask };
}
