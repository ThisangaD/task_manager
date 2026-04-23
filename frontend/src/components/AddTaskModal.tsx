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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#355872]/40 backdrop-blur-md">
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
            className="w-full max-w-[720px] relative overflow-hidden rounded-[28px] bg-[#F7F8F0] shadow-[0_24px_60px_rgba(53,88,114,0.3)] border border-[#7AAACE]/30"
          >
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#355872] via-[#7AAACE] to-[#9CD5FF]" />
            
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center text-[#355872]/60 bg-[#355872]/5 hover:text-[#355872] hover:bg-[#355872]/10 hover:scale-105 active:scale-95 transition-all outline-none z-10"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="px-8 pt-8 pb-6 border-b border-[#7AAACE]/20 bg-white/40">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#355872] tracking-tight">
                    {editTask ? 'Edit Mission' : 'Create New Mission'}
                  </h2>
                  {editTask && (
                    <p className="text-sm font-semibold text-[#7AAACE] mt-1">
                      Update objective details and timelines
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="px-8 py-8 space-y-7 relative z-10">
              <div className="space-y-2.5">
                <label className="text-xs font-black text-[#355872] uppercase tracking-widest pl-1">Mission Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white border border-[#7AAACE]/40 rounded-xl px-5 py-3.5 text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7AAACE]/50 focus:border-[#7AAACE]/50 transition-all font-semibold text-base shadow-sm"
                  placeholder="What needs to be accomplished?"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label className="text-xs font-black text-[#355872] uppercase tracking-widest pl-1">
                    Priority Level
                  </label>
                  <div className="flex p-1.5 bg-white rounded-xl border border-[#7AAACE]/40 shadow-sm gap-1.5">
                    {(['Low', 'Medium', 'High'] as Priority[]).map((p) => {
                      const isActive = priority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 py-3 sm:py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300
                            ${isActive
                              ? `bg-[#355872] text-white shadow-md scale-[1.02]`
                              : 'text-[#7AAACE] hover:text-[#355872] hover:bg-[#9CD5FF]/10'
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
                  <label className="text-xs font-black text-[#355872] uppercase tracking-widest pl-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-white border border-[#7AAACE]/40 rounded-xl px-5 py-3 sm:py-3.5 text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7AAACE]/50 focus:border-[#7AAACE]/50 transition-all font-semibold text-sm shadow-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2.5">
                <label className="text-xs font-black text-[#355872] uppercase tracking-widest pl-1 flex justify-between">
                  <span>Description / Details</span>
                  <span className="text-[#7AAACE] text-[10px] font-bold">OPTIONAL</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-white border border-[#7AAACE]/40 rounded-xl px-5 py-4 text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7AAACE]/50 focus:border-[#7AAACE]/50 transition-all font-medium text-sm leading-relaxed min-h-[140px] resize-y shadow-sm"
                  placeholder="Add technical context or execution criteria..."
                />
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-10 border-t border-[#7AAACE]/20">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-[#355872] bg-white border border-[#7AAACE]/40 hover:bg-[#F7F8F0] hover:border-[#355872] hover:scale-105 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className={`w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex justify-center items-center gap-2.5 transition-all duration-300 shadow-lg
                    ${!title.trim() 
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                      : 'bg-[#355872] text-white hover:bg-[#2A465B] hover:scale-105 active:scale-95 shadow-[#355872]/20'
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
