'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import TaskCard from '@/components/TaskCard';
import AddTaskModal from '@/components/AddTaskModal';
import { Task, TaskFilter } from '@/types';
import { 
  Plus, LogOut, CheckCircle2, Loader2, ListChecks, 
  Clock, LayoutDashboard, User as UserIcon, Calendar, TrendingUp, Search, Bell
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const { tasks, loading, createTask, toggleTask, updateTask, deleteTask } = useTasks(filter);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth');
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030303]">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
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
    { key: 'all',       label: 'Overview',  icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'pending',   label: 'In Progress',icon: <Clock className="w-4 h-4" /> },
    { key: 'completed', label: 'Completed',  icon: <ListChecks className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#030303] flex font-body">
      {/* Background Ambience */}
      <div className="bg-blob bg-brand-purple w-[800px] h-[500px] -top-40 left-1/2 -translate-x-1/2 opacity-[0.08]" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1200px] mx-auto px-6 py-10 relative z-10 w-full">
        
        {/* --- Header & Navigation --- */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-white tracking-tight">TaskFlow</h1>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">Workspace v1.2</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Action Icons */}
            <div className="hidden sm:flex items-center gap-3 pr-6 border-r border-white/10">
              <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <Search className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#030303]" />
              </button>
            </div>

            {/* Profile Dropdown Placeholder */}
            <div className="flex items-center gap-4 bg-white/5 p-1.5 pl-4 rounded-2xl border border-white/10">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-white leading-none mb-1 capitalize">{user?.email?.split('@')[0]}</p>
                <button onClick={logout} className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider transition-colors">Sign Out</button>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center border border-white/5 shadow-inner">
                <UserIcon className="w-5 h-5 text-slate-300" />
              </div>
            </div>
          </div>
        </header>

        {/* --- Welcome Section --- */}
        <div className="mb-12">
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-2"
          >
            <h2 className="text-4xl font-extrabold font-display text-white">
              Hi, <span className="text-gradient capitalize">{user?.email?.split('@')[0]}</span> 👋
            </h2>
            <p className="text-slate-400 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>
        </div>

        {/* --- Stats Cards Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Operational Tasks', value: tasks.length, color: 'purple', icon: <LayoutDashboard className="w-5 h-5" />, trend: '+12%' },
            { label: 'Action Required',   value: pendingCount, color: 'amber', icon: <Clock className="w-5 h-5" />, trend: 'High' },
            { label: 'Completed Unit',    value: completedCount, color: 'cyan', icon: <trendingUp className="w-5 h-5" />, trend: '84%' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-400 border border-${stat.color}-500/20`}>
                  {stat.icon}
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-${stat.color}-500/10 text-${stat.color}-400 border border-${stat.color}-500/20`}>
                  {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-4xl font-extrabold font-display text-white mb-1 leading-none">{stat.value}</p>
                <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- Main Workflow Section --- */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Left Column: Tasks */}
          <div className="flex-1 w-full order-2 lg:order-1">
            {/* Filter Segmented Control */}
            <div className="flex bg-white/5 rounded-2xl p-1.5 mb-8 border border-white/5 inline-flex">
              {filterTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative ${
                    filter === tab.key ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {filter === tab.key && (
                    <motion.div 
                      layoutId="activeFilter"
                      className="absolute inset-0 bg-brand-primary rounded-xl shadow-lg shadow-purple-500/30"
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Task List */}
            {loading ? (
              <div className="flex items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : tasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white/5 rounded-[32px] border border-dashed border-white/10"
              >
                <div className="w-20 h-20 rounded-3xl bg-surface-800 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Workspace Empty</h3>
                <p className="text-slate-500 text-sm max-w-[240px] mx-auto leading-relaxed">No active tasks found in this view. Start by adding a new one.</p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-4">
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

          {/* Right Column: Actions (Desktop) / FAB (Mobile) */}
          <div className="w-full lg:w-[340px] order-1 lg:order-2">
             <div className="glass-card p-8 sticky top-10">
                <h3 className="text-lg font-bold text-white mb-4 font-display">Fast Action</h3>
                <p className="text-sm text-slate-400 mb-8 leading-relaxed">Quickly add new items to your queue. Don't let your productive flow stop.</p>
                <button
                  onClick={() => { setEditTask(null); setIsModalOpen(true); }}
                  className="btn-primary w-full flex items-center justify-center gap-3 py-4 shadow-xl shadow-purple-500/20"
                >
                  <Plus className="w-6 h-6" />
                  <span className="font-bold">Add New Task</span>
                </button>
             </div>
          </div>
        </div>

      </main>

      {/* --- Modal --- */}
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
