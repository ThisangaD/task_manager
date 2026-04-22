'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import AddTaskModal from '@/components/AddTaskModal';
import { Task, TaskFilter, Priority } from '@/types';
import { 
  Plus, LogOut, CheckCircle2, Loader2,
  Calendar as CalendarIcon,
  Moon, Sun, Menu, X, Pencil, Trash2
} from 'lucide-react';
import Calendar from 'react-calendar';
import {
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  Select,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

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
  const [statusFilter, setStatusFilter] = useState<TaskFilter | 'need-action'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  
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

  const { tasks, createTask, updateTask, toggleTask, deleteTask } = useTasks('all');

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
  const pendingCount = tasks.filter(t => !t.isCompleted).length;
  const totalCount = tasks.length;
  const now = new Date();
  const needsAttentionCount = tasks.filter((task) => {
    if (task.isCompleted || !task.dueDate) return false;
    const due = new Date(task.dueDate);
    const daysUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilDue <= 2;
  }).length;

  const filteredTasks = tasks.filter((task) => {
    const isNeedActionTask = (() => {
      if (task.isCompleted || !task.dueDate) return false;
      const due = new Date(task.dueDate);
      const daysUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilDue <= 2;
    })();

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && !task.isCompleted) ||
      (statusFilter === 'completed' && task.isCompleted) ||
      (statusFilter === 'need-action' && isNeedActionTask);

    const matchesPriority =
      priorityFilter === 'all' ||
      (task.priority || 'Medium') === priorityFilter;

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 || task.title.toLowerCase().includes(query);

    return matchesStatus && matchesPriority && matchesSearch;
  });

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
              className="w-full max-w-[980px] rounded-[36px] overflow-hidden"
              style={{
                background: 'linear-gradient(155deg, #11244A 0%, #0B1C3E 24%, #061831 48%, #051024 74%, #030A1C 100%)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(148, 163, 184, 0.18)',
                boxShadow: '0 36px 90px rgba(3, 10, 28, 0.72), inset 0 1px 0 rgba(148, 163, 184, 0.14)',
                padding: 'clamp(24px, 4vw, 44px)',
              }}
            >

              {/* Header Action Row */}
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">Active Workflow</h2>
                  <p className="text-sm font-bold text-slate-500 mt-1">Track and manage your tasks from one place.</p>
                </div>
                <div style={{ display: 'inline-block' }}>
                  <style>{`
                    .uiverse-btn {
                      background: #0a1732;
                      border-radius: 0.5em;
                      box-shadow:
                        inset 0px -6px 18px -6px rgba(3, 15, 20, 0),
                        inset rgba(54, 69, 75, 1) -1px -1px 6px 0px,
                        inset 12px 0px 12px -6px rgba(3, 15, 20, 0),
                        inset -12px 0px 12px -6px rgba(3, 15, 20, 0),
                        rgba(54, 69, 75, 1) -1px -1px 6px 0px;
                      border: solid 2px #030f14;
                      cursor: pointer;
                      font-size: 18px;
                      padding: 0.7em 1.7em;
                      outline: none;
                      transition: all 0.3s;
                      user-select: none;
                    }
                    .uiverse-btn:hover {
                      box-shadow:
                        inset 0px -6px 18px -6px rgba(3, 15, 20, 1),
                        inset 0px 6px 18px -6px rgba(3, 15, 20, 1),
                        inset 12px 0px 12px -6px rgba(3, 15, 20, 0),
                        inset -12px 0px 12px -6px rgba(3, 15, 20, 0),
                        -1px -1px 6px 0px rgba(54, 69, 75, 1);
                    }
                    .uiverse-btn:active {
                      box-shadow:
                        inset 0px -12px 12px -6px rgba(3, 15, 20, 1),
                        inset 0px 12px 12px -6px rgba(3, 15, 20, 1),
                        inset 12px 0px 12px -6px rgba(3, 15, 20, 1),
                        inset -12px 0px 12px -6px rgba(3, 15, 20, 1),
                        -1px -1px 6px 0px rgba(54, 69, 75, 1);
                    }
                    .uiverse-text {
                      color: #d0a756;
                      font-weight: 700;
                      margin: auto;
                      transition: all 0.3s;
                      width: max-content;
                      display: block;
                    }
                    .uiverse-btn:hover .uiverse-text {
                      transform: scale(0.9);
                    }
                    .uiverse-btn:active .uiverse-text {
                      transform: scale(0.8);
                    }
                  `}</style>
                  <button
                    onClick={() => { setEditTask(null); setIsModalOpen(true); }}
                    className="uiverse-btn"
                  >
                    <span className="uiverse-text">New Mission</span>
                  </button>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                  {
                    label: 'Total',
                    value: totalCount,
                    card: 'bg-gradient-to-b from-[#1E3A70]/80 to-[#132A56]/70 border-[#7CA3E8]/25',
                  },
                  {
                    label: 'Needs Attention',
                    value: needsAttentionCount,
                    card: 'bg-gradient-to-b from-[#4A3A18]/78 to-[#35290F]/68 border-[#F2C96A]/28',
                  },
                  {
                    label: 'In Progress',
                    value: pendingCount,
                    card: 'bg-gradient-to-b from-[#2A2854]/78 to-[#1D1C3B]/68 border-[#A8A0FF]/26',
                  },
                  {
                    label: 'Completed',
                    value: completedCount,
                    card: 'bg-gradient-to-b from-[#163F35]/78 to-[#102F28]/68 border-[#74D4B4]/28',
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`rounded-[24px] border p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-sm transition-all hover:-translate-y-0.5 ${stat.card}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-[11px] font-black text-slate-200 uppercase tracking-widest translate-x-[10px]">{stat.label}</p>
                      <span className="text-3xl font-black text-white leading-none -translate-x-[20px]">{stat.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Task List Container */}
              <div className="mt-[30px] rounded-[28px] bg-gradient-to-b from-[#0E2145]/65 to-[#08162F]/70 p-6 min-h-[280px] shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-100 tracking-tight translate-x-[10px]">Tasks List</h3>
                  <span className="text-xs font-semibold text-slate-400 -translate-x-[10px]">{filteredTasks.length} result{filteredTasks.length === 1 ? '' : 's'}</span>
                </div>

                <div className="mb-4">
                  <TextField
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by task name"
                    size="small"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchRoundedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        color: '#e2e8f0',
                        backgroundColor: 'rgba(10, 23, 50, 0.75)',
                        '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.18)' },
                        '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.28)' },
                        '&.Mui-focused fieldset': { borderColor: 'rgba(139, 92, 246, 0.65)' },
                      },
                      '& .MuiInputBase-input::placeholder': { color: '#64748b', opacity: 1 },
                    }}
                  />
                </div>

                <div className="mb-[30px] flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <ToggleButtonGroup
                    value={statusFilter}
                    exclusive
                    onChange={(_, value) => {
                      if (value) setStatusFilter(value as TaskFilter | 'need-action');
                    }}
                    sx={{
                      backgroundColor: 'rgba(10, 23, 50, 0.75)',
                      borderRadius: '12px',
                      p: '4px',
                      gap: '3px',
                      '& .MuiToggleButton-root': {
                        border: 'none',
                        color: '#94a3b8',
                        textTransform: 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        px: 1.8,
                        py: 0.8,
                        borderRadius: '9px',
                      },
                      '& .Mui-selected': {
                        color: '#fff !important',
                        backgroundColor: '#7c3aed !important',
                        boxShadow: '0 8px 18px rgba(124,58,237,0.35)',
                      },
                    }}
                  >
                    <ToggleButton value="all">All</ToggleButton>
                    <ToggleButton value="pending">In Progress</ToggleButton>
                    <ToggleButton value="completed">Completed</ToggleButton>
                    <ToggleButton value="need-action">Need Action</ToggleButton>
                  </ToggleButtonGroup>

                  <FormControl size="small" className="w-full md:w-[200px]">
                    <Select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as 'all' | Priority)}
                      sx={{
                        borderRadius: '12px',
                        color: '#e2e8f0',
                        backgroundColor: 'rgba(10, 23, 50, 0.75)',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(148, 163, 184, 0.18)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(148, 163, 184, 0.28)' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(99, 102, 241, 0.65)' },
                        '& .MuiSvgIcon-root': { color: '#94a3b8' },
                      }}
                      MenuProps={{
                        slotProps: {
                          paper: {
                            sx: {
                              bgcolor: '#0a1732',
                              color: '#e2e8f0',
                              border: '1px solid rgba(148, 163, 184, 0.18)',
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                <div className="rounded-2xl bg-white/[0.02] min-h-[200px] p-3">
                  {filteredTasks.length === 0 ? (
                    <div className="h-full min-h-[180px] flex items-center justify-center">
                      <p className="text-sm text-slate-400">No tasks found for selected filters.</p>
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto rounded-xl bg-[#0A1732]/40 shadow-inner p-4">
                      <table className="w-full text-left min-w-[800px]">
                        <thead>
                          <tr className="bg-white/[0.02]">
                            <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Task Name</th>
                            <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Priority</th>
                            <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Due Date</th>
                            <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400 w-1/3">Description</th>
                            <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="h-[5px]" aria-hidden="true" />
                          {filteredTasks.map((task) => (
                            <tr key={task.id} className="group even:bg-[#11244A]/30 odd:bg-transparent hover:bg-white/[0.05] transition-colors">
                              {/* Task Name Column */}
                              <td className="px-5 py-5 align-top">
                                <span className={`font-semibold text-xs ${task.isCompleted ? 'text-slate-500' : 'text-slate-100'}`}>
                                  {task.title}
                                </span>
                              </td>

                              {/* Status Column */}
                              <td className="px-5 py-5 align-top">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md inline-flex items-center justify-center
                                  ${task.isCompleted 
                                    ? 'bg-emerald-500/10 text-emerald-400' 
                                    : 'bg-amber-500/10 text-amber-400'}
                                `}>
                                  {task.isCompleted ? 'Completed' : 'In Progress'}
                                </span>
                              </td>

                              {/* Priority Column */}
                              <td className="px-5 py-5 align-top">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md inline-flex items-center justify-center
                                  ${task.priority === 'High' ? 'bg-rose-500/10 text-rose-400' : 
                                    task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 
                                    'bg-emerald-500/10 text-emerald-400'}`}
                                >
                                  {task.priority || 'Medium'}
                                </span>
                              </td>

                              {/* Due Date Column */}
                              <td className="px-5 py-5 align-top">
                                <span className="text-[11px] font-semibold text-slate-300 whitespace-nowrap">
                                  {task.dueDate
                                      ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                      : <span className="text-slate-500 italic">Not set</span>}
                                </span>
                              </td>

                              {/* Description Column */}
                              <td className="px-5 py-5 align-top">
                                {task.description ? (
                                  <p className={`text-[11px] font-semibold leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all ${task.isCompleted ? 'text-slate-500' : 'text-slate-300'}`}>
                                    {task.description}
                                  </p>
                                ) : (
                                  <span className="text-[11px] font-semibold text-slate-500 italic">Not set</span>
                                )}
                              </td>

                              {/* Actions Column */}
                              <td className="px-5 py-5 align-top">
                                <div className="flex flex-wrap items-center justify-end gap-2.5">
                                  <button
                                    onClick={() => toggleTask(task.id, !task.isCompleted)}
                                    className={`h-8 px-3 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-200 active:scale-95
                                      ${task.isCompleted 
                                        ? 'bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-white ring-1 ring-white/10 hover:ring-white/30 hover:scale-105 hover:shadow-lg' 
                                        : 'bg-indigo-500 hover:bg-indigo-400 text-white ring-1 ring-indigo-500/50 hover:ring-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] hover:scale-105'}
                                    `}
                                  >
                                    {task.isCompleted ? 'Reopen' : 'Complete'}
                                  </button>

                                  <button
                                    onClick={() => { setEditTask(task); setIsModalOpen(true); }}
                                    className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white ring-1 ring-blue-500/30 hover:ring-blue-400 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                                    title="Edit Task Details"
                                  >
                                    <Pencil className="w-3 h-3" /> <span className="hidden lg:inline">Edit</span>
                                  </button>
                                  
                                  <button
                                    onClick={() => setDeleteTarget(task)}
                                    className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white ring-1 ring-rose-500/30 hover:ring-rose-400 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(225,29,72,0.6)]"
                                    title="Delete Task"
                                  >
                                    <Trash2 className="w-3 h-3" /> <span className="hidden lg:inline">Delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#0b1c3e',
              color: '#e2e8f0',
              border: '1px solid rgba(148,163,184,0.22)',
              borderRadius: '14px',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#94a3b8' }}>
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: '#cbd5e1' }}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (deleteTarget) {
                deleteTask(deleteTarget.id);
                setDeleteTarget(null);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
