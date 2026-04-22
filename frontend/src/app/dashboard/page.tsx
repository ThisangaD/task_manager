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
  Clock, LayoutDashboard, User as UserIcon, Calendar as CalendarIcon, TrendingUp, Search, Bell, Sparkles, Pencil,
  Moon, Sun, Menu, X
} from 'lucide-react';
import Calendar from 'react-calendar';

// --- Custom Calendar Styles ---
// Using a template string to inject modern, dark-themed CSS for react-calendar
const calendarStyles = `
  .react-calendar {
    width: 100% !important;
    background: transparent !important;
    border: none !important;
    font-family: inherit !important;
    color: #94a3b8 !important;
  }
  .react-calendar__navigation {
    margin-bottom: 1rem !important;
  }
  .react-calendar__navigation button {
    color: #e2e8f0 !important;
    min-width: 32px !important;
    background: none !important;
    font-weight: 900 !important;
    font-size: 14px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.1em !important;
  }
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: rgba(255, 255, 255, 0.05) !important;
    border-radius: 8px !important;
  }
  .react-calendar__month-view__weekdays {
    text-align: center !important;
    text-transform: uppercase !important;
    font-weight: 800 !important;
    font-size: 0.65rem !important;
    letter-spacing: 0.1em !important;
    color: #64748b !important;
    margin-bottom: 0.5rem !important;
  }
  .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none !important;
  }
  .react-calendar__tile {
    padding: 0.5rem 0.25rem !important;
    background: none !important;
    text-align: center !important;
    line-height: 1 !important;
    font-size: 0.75rem !important;
    font-weight: 600 !important;
    color: #94a3b8 !important;
    border-radius: 8px !important;
    transition: all 0.2s !important;
  }
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: rgba(124, 58, 237, 0.15) !important;
    color: #a78bfa !important;
  }
  .react-calendar__tile--now {
    background: rgba(124, 58, 237, 0.1) !important;
    color: #8b5cf6 !important;
    font-weight: 900 !important;
    box-shadow: inset 0 0 0 1px rgba(124, 58, 237, 0.3) !important;
  }
  .react-calendar__tile--active {
    background: #7c3aed !important;
    color: white !important;
    font-weight: 900 !important;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3) !important;
  }
  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: #6d28d9 !important;
  }
  .react-calendar__month-view__days__day--neighboringMonth {
    color: #334155 !important;
  }
`;

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, updateDisplayName } = useAuth();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  
  // Profile Name Editing states
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { tasks, loading, createTask, toggleTask, updateTask, deleteTask } = useTasks(filter);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth');
    if (user?.displayName) setTempName(user.displayName);
    else if (user?.email) setTempName(user.email.split('@')[0]);
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

  const handleEditSave = async (id: number, payload: Partial<Task>) => {
    await updateTask(id, payload);
    setEditTask(null);
  };

  const handleNameSubmit = async () => {
    if (tempName.trim() && tempName !== (user?.displayName || user?.email?.split('@')[0])) {
      await updateDisplayName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const filterTabs: { key: TaskFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all',       label: 'Overview',  icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'pending',   label: 'In Progress',icon: <Clock className="w-4 h-4" /> },
    { key: 'completed', label: 'Completed',  icon: <ListChecks className="w-4 h-4" /> },
  ];

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen flex font-body overflow-hidden">

      {/* Custom Styles Injection */}
      <style dangerouslySetInnerHTML={{ __html: calendarStyles }} />

      {/* --- SIDEBAR --- */}
      <div className="flex relative overflow-hidden w-full h-screen">
        {/* Toggle Button (Floating) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            position: 'fixed',
            left: isMobile ? '24px' : (isSidebarOpen ? '340px' : '24px'),
            top: '24px',
            zIndex: 100,
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
          className="hover:scale-110 active:scale-90 hover:bg-purple-500/20 hover:border-purple-500/30 group"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
          ) : (
            <Menu className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
          )}
        </button>

        {/* Mobile Backdrop */}
        <AnimatePresence>
          {isMobile && isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]"
            />
          )}
        </AnimatePresence>

        {/* --- SIDEBAR --- */}
        <motion.aside 
          initial={false}
          animate={{ 
            width: isSidebarOpen ? 320 : 0,
            x: isSidebarOpen ? 0 : -320,
            opacity: isSidebarOpen ? 1 : 0
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ 
            position: isMobile ? 'fixed' : 'relative',
            zIndex: 60,
          }}
          className="h-screen bg-[#0a0a0a] md:bg-white/[0.02] border-r border-white/5 flex flex-col backdrop-blur-xl overflow-hidden shadow-2xl"
        >
          <div className="w-[320px] p-10 h-full flex flex-col items-center overflow-y-auto custom-scrollbar no-scrollbar">
            
            {/* 1. Logo Section */}
            <div className="flex items-center justify-center gap-6 mb-16">
              <CheckCircle2 className="w-14 h-14 text-purple-500 shadow-purple-500/20" />
              <h1 className="text-5xl font-black font-display text-white tracking-tighter">TaskFlow</h1>
            </div>

            {/* 2, 3, 4. Middle Content (Greeting, clock, calendar) */}
            <div className="flex-1 w-full flex flex-col items-center">
              
              {/* Dynamic Greeting Message */}
              <div className="text-center px-4 mb-10">
                <h2 style={{ 
                  fontSize: '28px', 
                  fontWeight: '950', 
                  color: 'white', 
                  letterSpacing: '-0.03em',
                  lineHeight: '1.2'
                }}>
                  {getTimeGreeting()}, <br/>
                  <span style={{ color: '#8b5cf6' }}>{displayName}</span>
                </h2>
              </div>

              {/* Uiverse Clock Card Block */}
              <div 
                style={{ 
                  width: '280px',
                  height: '150px',
                  borderRadius: '24px',
                  display: 'flex',
                  color: 'white',
                  justifyContent: 'center',
                  position: 'relative',
                  flexDirection: 'column',
                  background: 'linear-gradient(to right, #141e30, #243b55)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.05)',
                  boxShadow: 'rgba(0,0,0,0.7) 5px 10px 50px, rgba(0,0,0,0.7) -5px 0px 250px',
                  textAlign: 'left',
                  marginBottom: '5px' /* Precise 5px gap below the clock */
                }}
                className="group hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Moon/Sun Icon */}
                <div 
                  style={{ right: '60px', top: '22px' }}
                  className="absolute transition-all duration-300 group-hover:scale-125 group-hover:rotate-12"
                >
                   {currentTime.getHours() >= 6 && currentTime.getHours() < 18 ? (
                     <Sun className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
                   ) : (
                     <Moon className="w-6 h-6 text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.4)]" />
                   )}
                </div>

                <div style={{ paddingLeft: '34px' }}>
                  <div className="flex items-baseline">
                    <span style={{ 
                      fontSize: '52px', 
                      fontWeight: '700', 
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}>
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                    <span style={{ 
                      fontSize: '14px', 
                      marginLeft: '6px',
                      fontWeight: '500',
                      color: 'rgba(255,255,255,0.6)'
                    }}>
                      {currentTime.getHours() >= 12 ? 'PM' : 'AM'}
                    </span>
                  </div>
                  
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '500',
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    marginTop: '-4px'
                  }}>
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                  </div>
                </div>
              </div>

              {/* Spacer for precise 20px gap */}
              <div style={{ height: '20px' }} />

              {/* Calendar Section */}
              <div className="w-full max-w-[280px]">
                 <div className="glass-card p-4 bg-white/[0.03] space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                       <span>Operational Calendar</span>
                       <CalendarIcon className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <div className="react-calendar-wrapper">
                      <Calendar 
                        className="custom-calendar"
                        view="month"
                        prev2Label={null}
                        next2Label={null}
                        calendarType="gregory"
                      />
                    </div>
                 </div>
              </div>
            </div>

            {/* 5. Sidebar Footer (Sign Out) */}
            <div className="mt-12 mb-4" style={{ transform: 'translateY(-30px)' }}>
              <div className="flex justify-center w-full">
                <button 
                  onClick={logout}
                  style={{
                    width: '160px',
                    height: '45px',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '10px 20px',
                    fontFamily: 'system-ui, sans-serif',
                    fontWeight: '800',
                    background: 'linear-gradient(0deg, #dc2626 0%, #ef4444 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: 'none',
                    outline: 'none',
                    textTransform: 'uppercase',
                    fontSize: '12px',
                    letterSpacing: '0.1em',
                    boxShadow: 'inset 2px 2px 2px 0px rgba(255,255,255,.3), 7px 7px 20px 0px rgba(0,0,0,.2), 4px 4px 5px 0px rgba(0,0,0,.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '4px 4px 6px 0 rgba(255,255,255,.1), -4px -4px 6px 0 rgba(0, 0, 0, .2), inset -4px -4px 6px 0 rgba(255,255,255,.2), inset 4px 4px 6px 0 rgba(0, 0, 0, .4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'inset 2px 2px 2px 0px rgba(255,255,255,.3), 7px 7px 20px 0px rgba(0,0,0,.2), 4px 4px 5px 0px rgba(0,0,0,.2)';
                  }}
                >
                  <LogOut style={{ width: '16px', height: '16px' }} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* --- MAIN CONTENT --- */}
        <motion.main 
          initial={false}
          animate={{ opacity: 1 }}
          className="flex-1 overflow-y-auto relative z-10 custom-scrollbar h-screen flex flex-col"
        >
          <div className="min-h-full flex flex-col items-center justify-center py-10 px-4 sm:px-8">
            {/* Main Container Card */}
            <div 
              className="w-full max-w-[900px] rounded-[32px] overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 32px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                padding: '40px',
              }}
            >

              {/* Header Action Row */}
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">Active Workflow</h2>
                  <p className="text-sm font-bold text-slate-500 mt-1">Manage and track your operational objectives.</p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { setEditTask(null); setIsModalOpen(true); }}
                    className="btn-primary flex items-center gap-3 px-8 shadow-2xl shadow-purple-600/20 active:scale-95 transition-transform"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="font-bold">New Mission</span>
                  </button>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  { label: 'Total Managed', value: tasks.length,    color: 'purple',  icon: <LayoutDashboard className="w-5 h-5" />, trend: 'Healthy'   },
                  { label: 'In Progress',   value: pendingCount,    color: 'amber',   icon: <Clock className="w-5 h-5" />,          trend: 'Attention' },
                  { label: 'Accomplished',  value: completedCount,  color: 'emerald', icon: <TrendingUp className="w-5 h-5" />,     trend: 'Growth'    },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-6 border-white/5 hover:border-white/10 transition-colors"
                    style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-400 ring-1 ring-${stat.color}-500/20`}>
                        {stat.icon}
                      </div>
                      <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-md bg-${stat.color}-500/5 text-${stat.color}-400`}>
                        {stat.trend}
                      </span>
                    </div>
                    <p className="text-3xl font-black text-white leading-none mb-1">{stat.value}</p>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Task Filtering & Content */}
              <div className="space-y-8">
                <div className="flex bg-white/[0.03] rounded-2xl p-1 overflow-x-auto no-scrollbar border border-white/5 inline-flex">
                  <div className="flex min-w-max">
                    {filterTabs.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-sm font-black tracking-widest uppercase transition-all duration-500 relative ${
                          filter === tab.key ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {filter === tab.key && (
                          <motion.div 
                            layoutId="activeFilter"
                            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl shadow-purple-600/30"
                          />
                        )}
                        <div className="relative z-10 flex items-center gap-2.5">
                          {tab.icon}
                          <span>{tab.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-h-[400px]">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white/[0.01] rounded-[40px] border border-dashed border-white/5">
                      <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                      <p className="mt-8 text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Synchronizing Workspace</p>
                    </div>
                  ) : tasks.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-32 bg-white/[0.01] rounded-[40px] border border-dashed border-white/5"
                    >
                      <CheckCircle2 className="w-12 h-12 text-slate-700 mx-auto mb-6" />
                      <h3 className="text-xl font-black text-white mb-2">Zero Missions</h3>
                      <p className="text-slate-500 text-sm max-w-[240px] mx-auto">No objectives found. Start your journey by creating a new task.</p>
                    </motion.div>
                  ) : (
                    <AnimatePresence mode="popLayout" initial={false}>
                      <div className="grid grid-cols-1 gap-4">
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
              </div>

            </div>
          </div>
        </motion.main>
    </div>

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
