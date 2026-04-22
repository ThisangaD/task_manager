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
import { CheckCircle2, Mail, Lock, ArrowRight, Loader2, ShieldCheck, Sparkles, Zap } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-[#030303] relative overflow-hidden font-body px-4">
      {/* Dynamic Background Blobs */}
      <div className="bg-blob bg-brand-purple w-[500px] h-[500px] -top-20 -left-20" />
      <div className="bg-blob bg-brand-secondary w-[400px] h-[400px] -bottom-20 -right-20" style={{ animationDelay: '-10s' }} />

      <div className="flex flex-col lg:flex-row max-w-5xl w-full gap-12 items-center relative z-10 py-12">
        
        {/* Branding & Marketing Section */}
        <div className="flex-1 text-center lg:text-left space-y-8 max-w-lg">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-center lg:justify-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-display tracking-tight text-white">TaskFlow</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-5xl lg:text-6xl font-extrabold font-display leading-[1.1] text-white">
              Master your <span className="text-gradient">workflow</span> with ease.
            </h1>
            <p className="text-slate-400 text-lg">
              The next-generation task manager designed for high-performance individuals and teams.
            </p>
          </motion.div>

          {/* Feature List */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4"
          >
            {[
              { icon: <Zap className="w-5 h-5 text-amber-400" />, label: 'Ultra Fast' },
              { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, label: 'Secure Auth' },
              { icon: <Sparkles className="w-5 h-5 text-purple-400" />, label: 'Cloud Sync' },
              { icon: <CheckCircle2 className="w-5 h-5 text-cyan-400" />, label: 'Optimistic UI' }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                {feature.icon}
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Auth Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px]"
        >
          <div className="glass-card p-8 lg:p-10 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold font-display text-white mb-2">
                {mode === 'login' ? 'Welcome back' : 'Join TaskFlow'}
              </h2>
              <p className="text-slate-400 text-sm">
                Enter your details to {mode === 'login' ? 'sign in to your account' : 'create your new account'}
              </p>
            </div>

            {/* Tab Selection */}
            <div className="flex bg-white/5 rounded-2xl p-1.5 mb-8 border border-white/5">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative ${
                    mode === m ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {mode === m && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/10 rounded-xl border border-white/10"
                    />
                  )}
                  <span className="relative z-10 capitalize">{m === 'login' ? 'Sign In' : 'Sign Up'}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="input-field pl-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input-field pl-12"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-3 text-base mt-2 py-3.5">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Authorized Access' : 'Create Account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-xs text-slate-500 leading-relaxed">
                By continuing, you agree to our <span className="text-slate-300 underline cursor-pointer">Terms of Service</span> and <span className="text-slate-300 underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
