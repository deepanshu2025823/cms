// app/login/page.tsx

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail, ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid admin email or password");
        setLoading(false);
      } else {
        router.push('/dashboard'); 
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white/[0.03] border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mb-6 border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            <ShieldCheck className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase tracking-tight">
            Admin Portal
          </h1>
          <p className="text-slate-400 text-sm mt-3 font-medium tracking-wide">
            InternX 360° Nurturing Dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm font-bold animate-in fade-in slide-in-from-top-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2 group">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-blue-400 transition-colors">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-700 font-medium"
                placeholder="admin@careerlab.com"
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-blue-400 transition-colors">
              Security Key
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-700 font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold uppercase tracking-widest text-sm rounded-xl transition-all disabled:opacity-50 disabled:scale-100 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Secure Login <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" /> End-to-End Encrypted Session
          </p>
        </div>

      </div>
    </div>
  );
}