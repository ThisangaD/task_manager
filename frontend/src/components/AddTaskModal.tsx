'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Sparkles, PlusCircle, CheckCircle2, Calendar, Flag } from 'lucide-react';
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#030303]/85 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass-card w-full max-w-[620px] p-0 relative overflow-hidden shadow-2xl border-white/10"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-indigo-400 to-cyan-500" />
            
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-7 sm:p-8 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  {editTask ? <Sparkles className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-display text-white">
                    {editTask ? 'Edit Mission' : 'Create New Mission'}
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                    {editTask ? 'Update objective details and timelines' : 'Add clear details for faster execution'}
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 p-7 sm:p-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mission Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input-field text-base font-bold"
                  placeholder="What needs to be accomplished?"
                  autoFocus
                />
                <p className="text-xs text-slate-500 ml-1">Use a short and actionable title so your team can understand it at a glance.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Flag className="w-3 h-3" /> Priority
                  </label>
                  <div className="flex p-1 bg-white/[0.04] rounded-xl border border-white/10 gap-1">
                    {(['Low', 'Medium', 'High'] as Priority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                          priority === p 
                            ? priorityColors[p] 
                            : 'text-slate-500 border-transparent hover:text-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="input-field text-xs py-2 pr-4 pl-3"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description / Notes</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="input-field min-h-[120px] resize-none text-sm leading-relaxed"
                  placeholder="Add context, acceptance criteria, links, or checklist details..."
                />
                <p className="text-xs text-slate-500 ml-1">Optional, but recommended for better handoff and progress tracking.</p>
              </div>
              
              <div className="flex items-center justify-between pt-5 border-t border-white/10 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="btn-primary min-w-[190px] flex justify-center items-center gap-2.5"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span className="font-bold">{editTask ? 'Save Mission' : 'Create Mission'}</span>
                      <CheckCircle2 className="w-5 h-5" />
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
