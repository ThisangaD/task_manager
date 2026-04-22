'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/types';
import { Check, Trash2, Pencil } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggle:  (id: number, isCompleted: boolean) => void;
  onDelete:  (id: number) => void;
  onEdit:    (task: Task) => void;
  index:     number; // Used for staggered animation delay
}

/**
 * Individual task card with hover-reveal action buttons and
 * a smooth completion animation using Framer Motion.
 */
export default function TaskCard({ task, onToggle, onDelete, onEdit, index }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout                              // Animate position changes
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`glass-card p-4 flex items-start gap-4 group transition-all duration-300 cursor-default
        ${task.isCompleted ? 'opacity-60' : ''}
        ${isHovered ? 'border-brand-violet/30 shadow-lg shadow-brand-purple/10' : ''}
      `}
    >
      {/* Completion toggle button */}
      <button
        onClick={() => onToggle(task.id, !task.isCompleted)}
        aria-label={task.isCompleted ? 'Mark as pending' : 'Mark as complete'}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 mt-0.5
          ${task.isCompleted
            ? 'bg-gradient-brand border-transparent'
            : 'border-slate-600 hover:border-brand-violet'
          }`}
      >
        {task.isCompleted && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </button>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm leading-snug transition-all duration-200
          ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
        )}
        <p className="text-xs text-slate-600 mt-2">
          {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Action buttons — revealed on hover */}
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 8 }}
        transition={{ duration: 0.15 }}
        className="flex items-center gap-1 flex-shrink-0"
      >
        <button
          onClick={() => onEdit(task)}
          aria-label="Edit task"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-brand-violet hover:bg-brand-purple/10 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </motion.div>
  );
}
