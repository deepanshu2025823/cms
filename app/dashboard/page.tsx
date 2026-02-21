// app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Loader2, Mail, Phone, MessageSquare, CheckCircle2, 
  Search, Bot, Filter, Zap, Users, Activity as ActivityIcon, 
  ShieldCheck, AlertTriangle, Ban
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
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0b0f1f] p-6 rounded-2xl border border-white/10 flex items-center gap-4 shadow-xl">
           <div className="p-3 bg-blue-500/10 rounded-xl"><Users className="text-blue-500 w-6 h-6" /></div>
           <div>
             <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Total Attendees</p>
             <h3 className="text-2xl font-black text-white">{attendees.length}</h3>
           </div>
        </div>
        <div className="bg-[#0b0f1f] p-6 rounded-2xl border border-white/10 flex items-center gap-4 shadow-xl">
           <div className="p-3 bg-green-500/10 rounded-xl"><CheckCircle2 className="text-green-500 w-6 h-6" /></div>
           <div>
             <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Total Registered</p>
             <h3 className="text-2xl font-black text-white">{attendees.filter(a => a.isRegistered).length}</h3>
           </div>
        </div>
        <div className="bg-[#0b0f1f] p-6 rounded-2xl border border-white/10 flex items-center gap-4 shadow-xl">
           <div className="p-3 bg-purple-500/10 rounded-xl"><Zap className="text-purple-500 w-6 h-6" /></div>
           <div>
             <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Manee Interventions</p>
             <h3 className="text-2xl font-black text-white">
               {attendees.reduce((acc, curr) => acc + curr.emailSent + curr.whatsappSent + curr.voiceCallCount, 0)}
             </h3>
           </div>
        </div>
      </div>

      <div className="bg-[#0b0f1f] border border-white/10 rounded-2xl shadow-2xl relative flex flex-col">
        <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search via name, email or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:border-blue-500 focus:bg-white/10 outline-none transition-all"
            />
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all">
            <Filter size={14}/> Filter Report
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Syncing Data</p>
          </div>
        ) : attendees.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-500">
            <ActivityIcon size={32} className="opacity-20"/>
            <p className="text-sm">Waiting for live data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar w-full">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1050px]">
              <thead>
                <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/10">
                  <th className="px-6 py-4">Attendee Identity</th>
                  <th className="px-6 py-4">Scholarship Status</th>
                  <th className="px-6 py-4 text-center bg-blue-500/5 text-blue-400">Manee Cycle</th>
                  <th className="px-6 py-4 text-center">Registration</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAttendees.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                          {lead.fullName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-bold text-white text-sm truncate max-w-[200px]">{lead.fullName}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{lead.email}</p>
                          <p className="text-[10px] text-blue-400 font-mono mt-0.5">{lead.phone}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 align-middle">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border shrink-0 ${
                            lead.status.toLowerCase() === 'passed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                            lead.status.toLowerCase() === 'disqualified' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {lead.status}
                          </span>
                          <span className="text-[11px] font-bold text-slate-300">
                            Score: <span className="text-white">{lead.score}%</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          {lead.cheatWarnings === 0 ? (
                            <span className="text-[10px] font-bold text-green-500 flex items-center gap-1 bg-green-500/10 px-1.5 py-0.5 rounded w-fit">
                              <ShieldCheck size={12}/> Clean Test
                            </span>
                          ) : lead.cheatWarnings === 1 ? (
                            <span className="text-[10px] font-bold text-yellow-500 flex items-center gap-1 bg-yellow-500/10 px-1.5 py-0.5 rounded w-fit">
                              <AlertTriangle size={12}/> 1 Warning
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded w-fit">
                              <Ban size={12}/> Disqualified
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 align-middle bg-blue-500/[0.02]">
                      <div className="flex justify-center items-center gap-3">
                        <div className="flex flex-col items-center" title="Emails Sent">
                          <div className="p-1.5 text-slate-400"><Mail size={14}/></div>
                          <span className="text-[11px] font-black text-white">{lead.emailSent}</span>
                        </div>
                        <div className="flex flex-col items-center" title="WhatsApp Sent">
                          <div className="p-1.5 text-green-500"><MessageSquare size={14}/></div>
                          <span className="text-[11px] font-black text-white">{lead.whatsappSent}</span>
                        </div>
                        <div className="flex flex-col items-center" title="Voice Calls">
                          <div className="p-1.5 text-blue-400"><Phone size={14}/></div>
                          <span className="text-[11px] font-black text-white">{lead.voiceCallCount}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 align-middle text-center">
                      {lead.isRegistered ? (
                        <div className="inline-flex items-center justify-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase w-28">
                          <CheckCircle2 size={12}/> Complete
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase w-28">
                          <ActivityIcon size={12}/> In Progress
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 align-middle text-right relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === lead.id ? null : lead.id)}
                        disabled={nurturingId === lead.id}
                        className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 inline-flex"
                      >
                        {nurturingId === lead.id ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
                      </button>

                      {activeMenu === lead.id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setActiveMenu(null)}></div>
                          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-44 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-40 py-1.5 overflow-hidden">
                             <p className="px-3 py-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1 text-center">Action</p>
                             <button onClick={() => triggerManee(lead.id, 'email')} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-colors">
                               <Mail size={12}/> Send Email
                             </button>
                             <button onClick={() => triggerManee(lead.id, 'whatsapp')} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-300 hover:bg-green-600 hover:text-white flex items-center gap-2 transition-colors">
                               <MessageSquare size={12}/> WhatsApp
                             </button>
                             <button onClick={() => triggerManee(lead.id, 'call')} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-300 hover:bg-indigo-600 hover:text-white flex items-center gap-2 transition-colors border-t border-white/5 mt-1 pt-1.5">
                               <Phone size={12}/> AI Call
                             </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}