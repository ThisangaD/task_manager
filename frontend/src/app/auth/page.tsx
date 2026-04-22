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
import { CheckCircle2, Mail, Lock, ArrowRight, Loader2, ShieldCheck, Sparkles, Zap, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode]       = useState<'login' | 'register'>('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="aurora-bg min-h-screen flex items-center justify-center relative overflow-hidden font-body px-4">
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


        </div>

        {/* Auth Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[500px]"
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
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '6px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: mode === m ? '#9333ea' : 'transparent',
                    color: mode === m ? '#ffffff' : '#64748b',
                    boxShadow: mode === m ? '0 4px 15px rgba(147, 51, 234, 0.4)' : 'none',
                  }}
                >
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', marginLeft: '4px' }}>
                  Email
                </label>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{
                      width: '90%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: '#F8FAFC',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', marginLeft: '4px' }}>
                  Password
                </label>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ position: 'relative', width: '90%' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '12px 48px 12px 16px',
                        color: '#F8FAFC',
                        fontSize: '14px',
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center justify-center gap-3 text-base py-3.5"
                  style={{ width: '50%' }}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Authorized Access' : 'Create Account'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
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
