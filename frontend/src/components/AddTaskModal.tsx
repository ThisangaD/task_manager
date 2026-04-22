'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, CreateTaskPayload } from '@/types';
import { X, Loader2, Sparkles, PlusCircle, CheckCircle2 } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  editTask: Task | null;
  onClose: () => void;
  onCreate: (payload: CreateTaskPayload) => Promise<void>;
  onUpdate: (id: number, payload: { title: string; description?: string }) => void;
}

export default function AddTaskModal({ isOpen, editTask, onClose, onCreate, onUpdate }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editTask) {
        setTitle(editTask.title);
        setDescription(editTask.description || '');
      } else {
        setTitle('');
        setDescription('');
      }
    }
  }, [isOpen, editTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);
    if (editTask) {
      await onUpdate(editTask.id, { title, description });
    } else {
      await onCreate({ title, description });
    }
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#030303]/80 backdrop-blur-md">
          {/* Modal Overlay backdrop click to close */}
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
            className="glass-card w-full max-w-[500px] p-8 relative overflow-hidden shadow-2xl border-white/10"
          >
            {/* Background Gradient flair */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-indigo-400 to-cyan-500" />
            
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                 {editTask ? <Sparkles className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
               </div>
               <div>
                 <h2 className="text-2xl font-bold font-display text-white">
                   {editTask ? 'Edit Objective' : 'New Objective'}
                 </h2>
                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                   {editTask ? 'Modify existing task details' : 'Define a new focus area'}
                 </p>
               </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input-field text-base font-bold"
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Additional Context</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="input-field min-h-[140px] resize-none text-sm leading-relaxed"
                  placeholder="Specify details, links, or sub-tasks..."
                />
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="btn-primary min-w-[160px] flex justify-center items-center gap-2.5"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span className="font-bold">{editTask ? 'Apply Changes' : 'Initialize Task'}</span>
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
