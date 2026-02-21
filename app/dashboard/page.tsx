// app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Loader2, Mail, Phone, MessageSquare, CheckCircle2, 
  Search, Bot, Filter, Zap, Users, Activity as ActivityIcon, 
  ShieldCheck, AlertTriangle, Ban, MoreVertical
} from 'lucide-react';

interface Attendee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  score: number;
  discountPercent: number;
  planName: string;
  status: string;
  emailSent: number;
  whatsappSent: number;
  voiceCallCount: number;
  isRegistered: boolean;
  cheatWarnings: number;
}

export default function Dashboard360() {
  const { data: session } = useSession();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [nurturingId, setNurturingId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAttendees = async () => {
    try {
      const res = await fetch('/api/attendees', {
        cache: 'no-store', 
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      });
      const data = await res.json();
      setAttendees(data);
    } catch (err) {
      console.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
    const interval = setInterval(fetchAttendees, 10000); 
    return () => clearInterval(interval);
  }, []);

  const triggerManee = async (id: string, type: 'email' | 'whatsapp' | 'call') => {
    setNurturingId(id);
    setActiveMenu(null);
    try {
      const res = await fetch('/api/nurture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type }),
      });

      if (res.ok) {
        await fetchAttendees(); 
        alert(`Manee AI initiated ${type} nurturing successfully!`);
      } else {
        alert("Action failed. Check console for details.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNurturingId(null);
    }
  };

  const filteredAttendees = attendees.filter(a => 
    a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.phone.includes(searchTerm)
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] p-5 sm:p-6 rounded-2xl border border-slate-800 flex items-center gap-4 shadow-lg">
           <div className="p-3 bg-blue-500/10 rounded-xl shrink-0"><Users className="text-blue-500 w-6 h-6" /></div>
           <div>
             <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Attendees</p>
             <h3 className="text-2xl font-black text-white">{attendees.length}</h3>
           </div>
        </div>
        <div className="bg-[#0f172a] p-5 sm:p-6 rounded-2xl border border-slate-800 flex items-center gap-4 shadow-lg">
           <div className="p-3 bg-green-500/10 rounded-xl shrink-0"><CheckCircle2 className="text-green-500 w-6 h-6" /></div>
           <div>
             <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Registered</p>
             <h3 className="text-2xl font-black text-white">{attendees.filter(a => a.isRegistered).length}</h3>
           </div>
        </div>
        <div className="bg-[#0f172a] p-5 sm:p-6 rounded-2xl border border-slate-800 flex items-center gap-4 shadow-lg sm:col-span-2 lg:col-span-1">
           <div className="p-3 bg-purple-500/10 rounded-xl shrink-0"><Zap className="text-purple-500 w-6 h-6" /></div>
           <div>
             <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Manee Interventions</p>
             <h3 className="text-2xl font-black text-white">
               {attendees.reduce((acc, curr) => acc + curr.emailSent + curr.whatsappSent + curr.voiceCallCount, 0)}
             </h3>
           </div>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all border border-slate-700">
            <Filter size={14}/> Filter
          </button>
        </div>

        <div className="w-full relative">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-xs font-bold text-slate-400">Syncing Data...</p>
            </div>
          ) : attendees.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-500">
              <ActivityIcon size={32} className="opacity-30"/>
              <p className="text-sm font-medium">Waiting for live data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full pb-32"> 
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <th className="px-6 py-4">Attendee Identity</th>
                    <th className="px-6 py-4">Scholarship Status</th>
                    <th className="px-6 py-4 text-center">Nurture Cycle</th>
                    <th className="px-6 py-4 text-center">Registration</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredAttendees.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-800/20 transition-colors group">
                      
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0 border border-slate-700">
                            {lead.fullName.charAt(0)}
                          </div>
                          <div className="flex flex-col max-w-[200px]">
                            <p className="font-semibold text-white text-sm truncate">{lead.fullName}</p>
                            <p className="text-[11px] text-slate-400 truncate">{lead.email}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{lead.phone}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 align-middle">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                              lead.status.toLowerCase() === 'passed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                              lead.status.toLowerCase() === 'disqualified' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {lead.status}
                            </span>
                            <span className="text-xs font-medium text-slate-300">
                              {lead.score}% Score
                            </span>
                          </div>
                          <div className="flex items-center">
                            {lead.cheatWarnings === 0 ? (
                              <span className="text-[10px] font-medium text-emerald-500 flex items-center gap-1">
                                <ShieldCheck size={12}/> Clean
                              </span>
                            ) : lead.cheatWarnings === 1 ? (
                              <span className="text-[10px] font-medium text-amber-500 flex items-center gap-1">
                                <AlertTriangle size={12}/> 1 Warning
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-rose-500 flex items-center gap-1">
                                <Ban size={12}/> Disqualified
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 align-middle">
                        <div className="flex justify-center items-center gap-4">
                          <div className="flex flex-col items-center gap-1">
                            <Mail size={14} className="text-slate-500"/>
                            <span className="text-xs font-bold text-slate-300">{lead.emailSent}</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <MessageSquare size={14} className="text-emerald-500"/>
                            <span className="text-xs font-bold text-emerald-400">{lead.whatsappSent}</span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <Phone size={14} className="text-blue-500"/>
                            <span className="text-xs font-bold text-blue-400">{lead.voiceCallCount}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 align-middle text-center">
                        {lead.isRegistered ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                            <CheckCircle2 size={14}/> Done
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                            <ActivityIcon size={14}/> Pending
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 align-middle text-right">
                        <div className="relative inline-block text-left">
                          <button 
                            onClick={() => setActiveMenu(activeMenu === lead.id ? null : lead.id)}
                            disabled={nurturingId === lead.id}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50 border border-slate-700"
                          >
                            {nurturingId === lead.id ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
                          </button>

                          {activeMenu === lead.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)}></div>
                              
                              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-slate-800 border border-slate-700 shadow-2xl z-50 overflow-hidden ring-1 ring-black ring-opacity-5 focus:outline-none">
                                 <div className="px-3 py-2 bg-slate-900 border-b border-slate-700">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Trigger Action</p>
                                 </div>
                                 <div className="py-1">
                                    <button 
                                      onClick={() => triggerManee(lead.id, 'email')} 
                                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"
                                    >
                                      <Mail size={14}/> Send Email
                                    </button>
                                    <button 
                                      onClick={() => triggerManee(lead.id, 'whatsapp')} 
                                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-emerald-600 hover:text-white flex items-center gap-3 transition-colors"
                                    >
                                      <MessageSquare size={14}/> WhatsApp
                                    </button>
                                    <button 
                                      onClick={() => triggerManee(lead.id, 'call')} 
                                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-indigo-600 hover:text-white flex items-center gap-3 transition-colors"
                                    >
                                      <Phone size={14}/> AI Call
                                    </button>
                                 </div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}