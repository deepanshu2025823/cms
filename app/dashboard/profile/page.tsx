// app/dashboard/profile/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { Mail, User, ShieldCheck, Calendar, Activity } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const role = (session?.user as any)?.role || "User";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      <div className="bg-[#0b0f1f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="h-32 md:h-48 bg-gradient-to-r from-blue-900 to-purple-900 relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="px-6 md:px-10 pb-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 relative z-10 mb-8">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#0b0f1f] bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-5xl md:text-6xl font-black text-white shadow-xl uppercase">
              {session?.user?.name?.charAt(0) || 'A'}
            </div>
            <div className="text-center md:text-left pb-2">
              <h1 className="text-3xl font-black text-white">{session?.user?.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {role}
                </span>
                <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2">Personal Information</h3>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-black/40 rounded-lg"><User className="w-5 h-5 text-slate-400" /></div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Full Name</p>
                  <p className="text-white font-medium">{session?.user?.name}</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-black/40 rounded-lg"><Mail className="w-5 h-5 text-slate-400" /></div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Email Address</p>
                  <p className="text-white font-medium">{session?.user?.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2">System Access</h3>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg"><ShieldCheck className="w-5 h-5 text-blue-400" /></div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Security Level</p>
                  <p className="text-white font-medium">{role === 'SUPER_ADMIN' ? 'Level 1 (Highest)' : 'Level 2 (Standard)'}</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-black/40 rounded-lg"><Calendar className="w-5 h-5 text-slate-400" /></div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Account Status</p>
                  <p className="text-white font-medium">Verified</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}