'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { CheckSquare, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

/**
 * Authentication page with a toggle between Login and Register forms.
 * Uses Framer Motion for smooth tab transitions.
 */
export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode]       = useState<'login' | 'register'>('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created! Welcome aboard 🎉');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back!');
      }
      router.push('/dashboard');
    } catch (err: any) {
      // Map Firebase error codes to user-friendly messages
      const msg = err.code === 'auth/email-already-in-use'
        ? 'This email is already registered.'
        : err.code === 'auth/wrong-password'
        ? 'Incorrect password.'
        : err.code === 'auth/user-not-found'
        ? 'No account found with this email.'
        : 'Something went wrong. Please try again.';

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card w-full max-w-md p-8 mx-4 relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-cyan flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold font-display bg-gradient-to-r from-brand-violet to-brand-cyan bg-clip-text text-transparent">
            TaskFlow
          </h1>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-surface-800 rounded-xl p-1 mb-8">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                mode === m
                  ? 'bg-gradient-brand text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 10 : -10 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="input-field pl-10"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-field pl-10"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
