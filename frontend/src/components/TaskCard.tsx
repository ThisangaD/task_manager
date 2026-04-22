'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import { Check, Trash2, Pencil, Calendar, Circle, CheckCircle2, ChevronRight } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggle:  (id: number, isCompleted: boolean) => void;
  onDelete:  (id: number) => void;
  onEdit:    (task: Task) => void;
  index:     number;
}

export default function TaskCard({ task, onToggle, onDelete, onEdit, index }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Generate a mock priority for UI flair
  const priorities = ['High', 'Medium', 'Low'];
  const priority = priorities[task.id % 3]; // Deterministic mock priority

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ 
        delay: index * 0.04, 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`glass-card p-5 flex items-center gap-5 transition-all duration-500 group relative
        ${task.isCompleted ? 'bg-white/[0.02] border-white/5 opacity-50' : 'hover:bg-white/[0.04]'}
      `}
    >
      {/* Interactive Completion Ring */}
      <button
        onClick={() => onToggle(task.id, !task.isCompleted)}
        className="relative flex-shrink-0 w-8 h-8 flex items-center justify-center group/btn"
      >
        <AnimatePresence mode="wait">
          {task.isCompleted ? (
            <motion.div
              key="completed"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/30"
            >
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </motion.div>
          ) : (
            <motion.div
              key="pending"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-7 h-7 rounded-full border-2 border-slate-700 group-hover/btn:border-purple-500 transition-colors flex items-center justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-transparent group-hover/btn:bg-purple-500/50 transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Task Information */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
          <h4 className={`text-base font-bold font-display transition-all duration-500 truncate
            ${task.isCompleted ? 'text-slate-500 line-through' : 'text-white'}`}
          >
            {task.title}
          </h4>
          
          {/* Priority Badge */}
          {!task.isCompleted && (
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border
              ${priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}
            `}>
              {priority}
            </span>
          )}
        </div>

        {task.description && (
          <p className={`text-sm leading-relaxed mb-3 line-clamp-1 transition-colors
            ${task.isCompleted ? 'text-slate-600' : 'text-slate-400'}`}
          >
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
           <span className="flex items-center gap-1.5">
             <Calendar className="w-3 h-3" />
             {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
           </span>
           <span className="hidden sm:inline opacity-50">•</span>
           <span className="hidden sm:inline">Ref: #{task.id.toString().padStart(4, '0')}</span>
        </div>
      </div>

      {/* Interactive Actions Overlay */}
      <div className={`flex items-center gap-2 transition-all duration-300
        ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0 pointer-events-none'}
      `}>
        <button
          onClick={() => onEdit(task)}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-sm"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/5 border border-red-500/10 text-slate-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Decorative arrow icon for completion hint on hover */}
      {!task.isCompleted && (
        <div className="absolute right-4 text-slate-800 group-hover:text-purple-500/20 transition-colors pointer-events-none">
          <ChevronRight className="w-8 h-8" strokeWidth={3} />
        </div>
      )}
    </motion.div>
  );
}
