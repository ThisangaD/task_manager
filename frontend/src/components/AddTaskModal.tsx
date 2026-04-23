'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Task, CreateTaskPayload, Priority } from '@/types';

interface AddTaskModalProps {
  isOpen: boolean;
  editTask: Task | null;
  onClose: () => void;
  onCreate: (payload: CreateTaskPayload) => Promise<void>;
  onUpdate: (id: number, payload: Partial<CreateTaskPayload>) => Promise<void>;
}

export default function AddTaskModal({ isOpen, editTask, onClose, onCreate, onUpdate }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editTask) {
        setTitle(editTask.title);
        setDescription(editTask.description || '');
        setPriority(editTask.priority || 'Medium');
        setDueDate(editTask.dueDate ? new Date(editTask.dueDate).toISOString().split('T')[0] : '');
      } else {
        setTitle('');
        setDescription('');
        setPriority('Medium');
        setDueDate('');
      }
    }
  }, [isOpen, editTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);
    const payload = { 
      title: title.trim(), 
      description: description.trim() || undefined, 
      priority,
      dueDate: dueDate || undefined 
    };

    if (editTask) {
      await onUpdate(editTask.id, payload);
    } else {
      await onCreate(payload);
    }
    setLoading(false);
    onClose();
  };

  const priorityColors = {
    Low: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5',
    Medium: 'text-amber-400 border-amber-400/20 bg-amber-400/5',
    High: 'text-rose-400 border-rose-400/20 bg-rose-400/5',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#030303]/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-[640px] relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#0E2145] to-[#0A1732] shadow-[0_24px_60px_rgba(0,0,0,0.6)] border border-slate-700/50"
          >
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400" />
            
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 bg-slate-800/50 hover:text-white hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all outline-none ring-2 ring-transparent focus:ring-slate-500 z-10"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="px-8 pt-8 pb-6 border-b border-slate-700/50 bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {editTask ? 'Edit Mission' : 'Create New Mission'}
                  </h2>
                  <p className="text-sm font-semibold text-slate-400 mt-1">
                    {editTask ? 'Update objective details and timelines' : 'Set up clear parameters for faster execution'}
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="px-8 py-8 space-y-7 relative z-10">
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Mission Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#060F25]/80 border border-slate-700/60 rounded-xl px-5 py-3.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-semibold text-base shadow-inner"
                  placeholder="What needs to be accomplished?"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                    Priority Level
                  </label>
                  <div className="flex p-1.5 bg-[#060F25]/80 rounded-xl border border-slate-700/60 shadow-inner gap-1.5">
                    {(['Low', 'Medium', 'High'] as Priority[]).map((p) => {
                      const isActive = priority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 py-3 sm:py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300
                            ${isActive
                              ? `bg-gradient-to-b shadow-md scale-[1.02] border-transparent ${
                                  p === 'High' ? 'from-rose-500/20 to-rose-600/10 text-rose-400 ring-1 ring-rose-500/50 shadow-rose-500/20' :
                                  p === 'Medium' ? 'from-amber-500/20 to-amber-600/10 text-amber-400 ring-1 ring-amber-500/50 shadow-amber-500/20' :
                                  'from-emerald-500/20 to-emerald-600/10 text-emerald-400 ring-1 ring-emerald-500/50 shadow-emerald-500/20'
                                }`
                              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
                            }
                          `}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-[#060F25]/80 border border-slate-700/60 rounded-xl px-5 py-3 sm:py-3.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-semibold text-sm shadow-inner [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:p-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 flex justify-between">
                  <span className="flex items-center gap-2">Description / Details</span>
                  <span className="text-slate-600 text-[10px] font-bold">OPTIONAL</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[#060F25]/80 border border-slate-700/60 rounded-xl px-5 py-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium text-sm leading-relaxed min-h-[140px] resize-y shadow-inner"
                  placeholder="Add technical context, execution criteria, or helpful notes for handoff..."
                />
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-10 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-800/30 border border-slate-700 hover:text-white hover:bg-slate-700 hover:border-slate-500 hover:scale-105 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className={`w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex justify-center items-center gap-2.5 transition-all duration-300 border shadow-lg
                    ${!title.trim() 
                      ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400/50 hover:from-indigo-500 hover:to-purple-500 hover:scale-105 active:scale-95 shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:ring-2 ring-indigo-500/30'
                    }
                  `}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{editTask ? 'Save Updates' : 'Launch Mission'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
