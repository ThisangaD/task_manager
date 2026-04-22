'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import { Check, Trash2, Pencil, Calendar, Flag, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggle: (id: number, isCompleted: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  index: number;
}

export default function TaskCard({ task, onToggle, onDelete, onEdit, index }: TaskCardProps) {
  const priorityStyles = {
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        delay: index * 0.04, 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className={`glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 transition-all duration-500 group relative overflow-hidden
        ${task.isCompleted ? 'bg-white/[0.01] border-white/5' : 'hover:bg-white/[0.03]'}
      `}
    >
      {/* Visual Indicator of Priority on the Edge */}
      {!task.isCompleted && (
        <div className={`absolute top-0 left-0 bottom-0 w-1 ${
          task.priority === 'High' ? 'bg-rose-500' : 
          task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
        }`} />
      )}

      {/* Checkbox Section */}
      <div className="flex-shrink-0 pt-1 sm:pt-0">
        <button
          onClick={() => onToggle(task.id, !task.isCompleted)}
          className="relative w-7 h-7 flex items-center justify-center group/btn"
        >
          <AnimatePresence mode="wait">
            {task.isCompleted ? (
              <motion.div
                key="completed"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20"
              >
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </motion.div>
            ) : (
              <motion.div
                key="pending"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-7 h-7 rounded-lg border-2 border-slate-700 group-hover/btn:border-purple-500 transition-all flex items-center justify-center bg-white/5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover/btn:bg-purple-500 transition-colors" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
          <h4 className={`text-lg font-bold font-display transition-all duration-500
            ${task.isCompleted ? 'text-slate-500 line-through decoration-slate-700' : 'text-slate-100'}`}
          >
            {task.title}
          </h4>
          
          <div className="flex items-center gap-2">
            {!task.isCompleted && (
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${priorityStyles[task.priority || 'Medium']}`}>
                <Flag className="w-3 h-3" />
                {task.priority || 'Medium'}
              </span>
            )}
            {task.isCompleted && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-800/50 text-slate-500 border border-slate-700/50">
                Archived
              </span>
            )}
          </div>
        </div>

        {task.description && (
          <p className={`text-sm leading-relaxed mb-4 max-w-2xl transition-colors
            ${task.isCompleted ? 'text-slate-600' : 'text-slate-400'}`}
          >
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
           <div className={`flex items-center gap-1.5 transition-colors ${task.dueDate && !task.isCompleted ? 'text-purple-400/80' : ''}`}>
             <Calendar className="w-3.5 h-3.5" />
             {task.dueDate 
               ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
               : 'No deadline'}
           </div>
           
           <div className="flex items-center gap-1.5 opacity-60">
             <AlertCircle className="w-3.5 h-3.5" />
             ID: {task.id.toString().padStart(4, '0')}
           </div>

           {/* Quick Status Control on Mobile/Visible when hovered on Desktop */}
           <div className={`sm:hidden flex items-center gap-1.5 transition-all
             ${task.isCompleted ? 'text-emerald-500 font-black' : 'text-amber-500'}
           `}>
             • {task.isCompleted ? 'Task Accomplished' : 'Awaiting Progress'}
           </div>
        </div>
      </div>

      {/* Action Suite */}
      <div className="flex items-center gap-2 mt-4 sm:mt-0 ml-auto">
        {/* Explicit Status Toggle Button */}
        <button
          onClick={() => onToggle(task.id, !task.isCompleted)}
          className={`h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all border
            ${task.isCompleted 
              ? 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white' 
              : 'bg-purple-500 text-white border-purple-400 hover:bg-purple-600 shadow-lg shadow-purple-500/25'}
          `}
        >
          {task.isCompleted ? (
            <><RefreshCw className="w-3.5 h-3.5" /> Reopen</>
          ) : (
            <><CheckCircle2 className="w-3.5 h-3.5" /> Complete</>
          )}
        </button>

        <button
          onClick={() => onEdit(task)}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          title="Edit Details"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          title="Delete Task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
