'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import TaskCard from '@/components/TaskCard';
import AddTaskModal from '@/components/AddTaskModal';
import { Task, TaskFilter } from '@/types';
import { Plus, LogOut, CheckSquare, Loader2, ListChecks, Clock, LayoutDashboard } from 'lucide-react';

/**
 * Main dashboard page. Protected — redirects to /auth if not logged in.
 * Shows stats, task list with filters, and a FAB to add new tasks.
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const { tasks, loading, createTask, toggleTask, updateTask, deleteTask } = useTasks(filter);

  // Redirect unauthenticated users to the login page
  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth');
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
        <Loader2 className="w-8 h-8 text-brand-violet animate-spin" />
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const pendingCount   = tasks.filter(t => !t.isCompleted).length;

  const handleEditSave = (id: number, payload: { title: string; description?: string }) => {
    updateTask(id, payload);
    setEditTask(null);
  };

  const filterTabs: { key: TaskFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all',       label: 'All Tasks',  icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'pending',   label: 'Pending',    icon: <Clock className="w-4 h-4" /> },
    { key: 'completed', label: 'Completed',  icon: <ListChecks className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">

        {/* ─── Header ─── */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-purple to-brand-cyan flex items-center justify-center">
              <CheckSquare className="w-4.5 h-4.5 text-white" />
            </div>
            <h1 className="text-xl font-bold font-display bg-gradient-to-r from-brand-violet to-brand-cyan bg-clip-text text-transparent">
              TaskFlow
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-500 hidden sm:block">{user?.email}</p>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Total',     value: tasks.length,   color: 'from-brand-purple to-brand-indigo' },
            { label: 'Pending',   value: pendingCount,   color: 'from-amber-500 to-orange-500' },
            { label: 'Completed', value: completedCount, color: 'from-emerald-500 to-teal-500' },
          ].map(stat => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 text-center"
            >
              <p className={`text-2xl font-bold font-display bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ─── Filter Tabs ─── */}
        <div className="flex gap-2 mb-6">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === tab.key
                  ? 'bg-gradient-brand text-white shadow-md shadow-brand-purple/30'
                  : 'glass-card text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ─── Task List ─── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-brand-violet animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm">No tasks yet. Add one to get started!</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onEdit={(t) => { setEditTask(t); setIsModalOpen(true); }}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* ─── Floating Action Button ─── */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setEditTask(null); setIsModalOpen(true); }}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl btn-primary flex items-center justify-center shadow-xl shadow-brand-purple/30"
        aria-label="Add new task"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* ─── Add/Edit Modal ─── */}
      <AddTaskModal
        isOpen={isModalOpen}
        editTask={editTask}
        onClose={() => { setIsModalOpen(false); setEditTask(null); }}
        onCreate={createTask}
        onUpdate={handleEditSave}
      />
    </div>
  );
}
