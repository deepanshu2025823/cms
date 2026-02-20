// app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Loader2, Mail, Phone, MessageSquare, CheckCircle2, 
  XCircle, Search, Bot, Filter, Zap, Users, Activity as ActivityIcon, 
  ShieldCheck,
  AlertTriangle,
  Ban
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
      const res = await fetch('/api/attendees');
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
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0b0f1f] p-6 rounded-2xl border border-white/10 flex items-center gap-4 shadow-xl">
           <div className="p-3 bg-blue-500/10 rounded-xl"><Users className="text-blue-500" /></div>
           <div>
             <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Total Attendees</p>
             <h3 className="text-2xl font-black text-white">{attendees.length}</h3>
           </div>
        </div>
        <div className="bg-[#0b0f1f] p-6 rounded-2xl border border-white/10 flex items-center gap-4 shadow-xl">
           <div className="p-3 bg-green-500/10 rounded-xl"><CheckCircle2 className="text-green-500" /></div>
           <div>
             <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Total Registered</p>
             <h3 className="text-2xl font-black text-white">{attendees.filter(a => a.isRegistered).length}</h3>
           </div>
        </div>
        <div className="bg-[#0b0f1f] p-6 rounded-2xl border border-white/10 flex items-center gap-4 shadow-xl">
           <div className="p-3 bg-purple-500/10 rounded-xl"><Zap className="text-purple-500" /></div>
           <div>
             <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Manee Interventions</p>
             <h3 className="text-2xl font-black text-white">
               {attendees.reduce((acc, curr) => acc + curr.emailSent + curr.whatsappSent + curr.voiceCallCount, 0)}
             </h3>
           </div>
        </div>
      </div>

      <div className="bg-[#0b0f1f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.01]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-3 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search via name, email or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">
              <Filter size={14}/> Filter Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-xs font-black uppercase text-slate-500 tracking-[0.2em]">Syncing 360° Data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-white/[0.03] text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/10">
                  <th className="p-5 pl-8">Attendee Identity</th>
                  <th className="p-5">Scholarship Status</th>
                  <th className="p-5 text-center bg-blue-900/10 border-x border-white/5 text-blue-400">
                    Manee AI Nurturing Cycle
                  </th>
                  <th className="p-5 text-center">Registration</th>
                  <th className="p-5 pr-8 text-right">360° Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAttendees.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-5 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white font-black text-lg shadow-lg">
                          {lead.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-white text-sm">{lead.fullName}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{lead.email}</p>
                          <p className="text-[10px] text-blue-500 font-mono mt-0.5">{lead.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
  <div className="space-y-2">
    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase border ${
      lead.status === 'PASSED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
      lead.status === 'disqualified' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    }`}>
      {lead.status}
    </span>
    <p className="text-xs font-bold text-white tracking-tight">
      Score: <span className="text-blue-400">{lead.score}%</span> — {lead.discountPercent}% Off
    </p>
    
    <div className="flex items-center gap-1.5 mt-2">
      {lead.cheatWarnings === 0 ? (
        <span className="text-[10px] font-bold text-green-500 flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-sm w-fit">
          <ShieldCheck size={12}/> Clean Test
        </span>
      ) : lead.cheatWarnings === 1 ? (
        <span className="text-[10px] font-bold text-yellow-500 flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded-sm w-fit">
          <AlertTriangle size={12}/> 1 Warning
        </span>
      ) : (
        <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-sm w-fit animate-pulse">
          <Ban size={12}/> Disqualified
        </span>
      )}
    </div>
  </div>
</td>
                    <td className="p-5 bg-blue-900/[0.03] border-x border-white/5">
                      <div className="flex justify-center items-center gap-4">
                        <div className="flex flex-col items-center gap-1" title="Emails Sent">
                          <div className="p-2 bg-black/40 rounded-lg border border-white/5"><Mail size={14} className="text-slate-500"/></div>
                          <span className="text-xs font-black text-white">{lead.emailSent}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1" title="WhatsApp Sent">
                          <div className="p-2 bg-green-500/5 rounded-lg border border-green-500/10"><MessageSquare size={14} className="text-green-500"/></div>
                          <span className="text-xs font-black text-green-400">{lead.whatsappSent}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1" title="Voice Calls">
                          <div className="p-2 bg-blue-500/5 rounded-lg border border-blue-500/10"><Phone size={14} className="text-blue-400"/></div>
                          <span className="text-xs font-black text-blue-400">{lead.voiceCallCount}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      {lead.isRegistered ? (
                        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                          <CheckCircle2 size={14}/> Complete
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                          <ActivityIcon size={14}/> In Progress
                        </div>
                      )}
                    </td>
                    <td className="p-5 pr-8 text-right relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === lead.id ? null : lead.id)}
                        disabled={nurturingId === lead.id}
                        className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {nurturingId === lead.id ? <Loader2 size={18} className="animate-spin" /> : <Bot size={18} />}
                      </button>

                      {activeMenu === lead.id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setActiveMenu(null)}></div>
                          <div className="absolute right-8 mt-2 w-48 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl z-40 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                             <p className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1 text-center">Nurture Path</p>
                             <button onClick={() => triggerManee(lead.id, 'email')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors">
                               <Mail size={14}/> Send Manee Email
                             </button>
                             <button onClick={() => triggerManee(lead.id, 'whatsapp')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-green-600 hover:text-white flex items-center gap-3 transition-colors">
                               <MessageSquare size={14}/> Manee WhatsApp
                             </button>
                             <button onClick={() => triggerManee(lead.id, 'call')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-indigo-600 hover:text-white flex items-center gap-3 transition-colors border-t border-white/5 mt-1 pt-2">
                               <Phone size={14}/> AI Voice Call
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