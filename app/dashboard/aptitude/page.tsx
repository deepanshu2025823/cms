// app/dashboard/aptitude/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Loader2, Mail, Phone, MessageSquare, CheckCircle2, 
  Search, Bot, Filter, Zap, Users, Activity as ActivityIcon, 
  ShieldCheck, AlertTriangle, Ban, X, Trash2, Send, Eye, Check, XCircle, Briefcase
} from 'lucide-react';

interface TestResponse {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface Attendee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  score: number;
  planName: string;
  testType: string;
  status: string;
  emailSent: number;
  whatsappSent: number;
  voiceCallCount: number;
  isRegistered: boolean;
  cheatWarnings: number;
  collegeName: string;
  qualification: string;
  city: string;
  state: string;
  testResponses?: TestResponse[] | null; 
}

export default function AptitudeDashboard() {
  const { data: session } = useSession();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeMenu, setActiveMenu] = useState<string | null>(null); 
  
  const [isDrafting, setIsDrafting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [draftModal, setDraftModal] = useState<{isOpen: boolean, type: string, lead: Attendee | null}>({isOpen: false, type: '', lead: null});
  const [draftContent, setDraftContent] = useState('');
  
  const [reportModal, setReportModal] = useState<{isOpen: boolean, lead: Attendee | null}>({isOpen: false, lead: null});

  const [searchTerm, setSearchTerm] = useState('');
  const [clearing, setClearing] = useState(false);

  const prevAttendeesCount = useRef<number | null>(null);
  const autoCallTriggered = useRef<Set<string>>(new Set());

  const fetchAttendees = async () => {
    try {
      const res = await fetch('/api/attendees', { cache: 'no-store' });
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const aptitudeLeads = data.filter((lead: Attendee) => lead.testType === 'aptitude');
        setAttendees(aptitudeLeads);
      }
    } catch (err) { 
      console.error("Failed to fetch leads", err); 
    } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAttendees();
    const interval = setInterval(fetchAttendees, 10000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (prevAttendeesCount.current !== null && attendees.length > prevAttendeesCount.current) {
      const newLead = attendees[0]; 
      
      if (newLead && !autoCallTriggered.current.has(newLead.id)) {
        autoCallTriggered.current.add(newLead.id);
        
        setTimeout(() => {
          fetch('/api/nurture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: newLead.id, type: 'call', action: 'auto_call' }),
          }).then(() => fetchAttendees());
        }, 2000); 
      }
    }
    prevAttendeesCount.current = attendees.length;
  }, [attendees]);

  const handleGenerateDraft = async (lead: Attendee, type: string) => {
    setActiveMenu(null);
    setIsDrafting(true);
    setDraftModal({ isOpen: true, type, lead });
    setDraftContent("Manee 2.5 Flash is writing the script...");

    try {
      const res = await fetch('/api/nurture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, type, action: 'generate' }),
      });
      const data = await res.json();
      if (res.ok) setDraftContent(data.draft);
      else setDraftContent("Error generating draft. Please try again.");
    } catch (err) { setDraftContent("Network Error."); } 
    finally { setIsDrafting(false); }
  };

  const handlePublishDraft = async () => {
    if(!draftModal.lead) return;
    setIsPublishing(true);

    try {
      const res = await fetch('/api/nurture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: draftModal.lead.id, type: draftModal.type, action: 'send', content: draftContent }),
      });

      if (res.ok) {
        if(draftModal.type === 'whatsapp') {
            const waUrl = `https://wa.me/${draftModal.lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(draftContent)}`;
            window.open(waUrl, '_blank');
        } 
        await fetchAttendees(); 
        setDraftModal({isOpen: false, type: '', lead: null});
      }
    } catch (err) { console.error("System Error"); } 
    finally { setIsPublishing(false); }
  };

  const handleClearData = async () => {
    if(!window.confirm("🚨 WARNING: This will permanently delete ALL Aptitude Data. Are you sure?")) return;
    setClearing(true);
    try {
      const res = await fetch('/api/clear-data', { method: 'DELETE' });
      if(res.ok) { 
          setAttendees([]); 
          prevAttendeesCount.current = 0; 
          autoCallTriggered.current.clear();
      }
    } catch (err) {} finally { setClearing(false); }
  };

  const filteredAttendees = attendees.filter(a => 
    a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.phone.includes(searchTerm) ||
    a.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12 font-sans relative">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-purple-900/50 flex items-center gap-4 shadow-lg">
           <div className="p-3 bg-purple-500/10 rounded-xl"><Briefcase className="text-purple-500 w-6 h-6" /></div>
           <div><p className="text-[10px] uppercase font-bold text-slate-400">Total Applicants</p><h3 className="text-2xl font-black text-white">{attendees.length}</h3></div>
        </div>
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 flex items-center gap-4 shadow-lg">
           <div className="p-3 bg-green-500/10 rounded-xl"><CheckCircle2 className="text-green-500 w-6 h-6" /></div>
           <div><p className="text-[10px] uppercase font-bold text-slate-400">Hired / Registered</p><h3 className="text-2xl font-black text-white">{attendees.filter(a => a.isRegistered).length}</h3></div>
        </div>
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 flex items-center gap-4 shadow-lg">
           <div className="p-3 bg-indigo-500/10 rounded-xl"><Zap className="text-indigo-500 w-6 h-6" /></div>
           <div><p className="text-[10px] uppercase font-bold text-slate-400">HR Interventions</p><h3 className="text-2xl font-black text-white">{attendees.reduce((a, c) => a + c.emailSent + c.whatsappSent + c.voiceCallCount, 0)}</h3></div>
        </div>
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Search name or college..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-purple-500 outline-none" />
          </div>
          <div className="flex w-full md:w-auto items-center gap-3">
            <button className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold border border-slate-700"><Filter size={14}/> Filter</button>
            <button onClick={handleClearData} disabled={clearing} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold border border-red-500/20">{clearing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14}/>} Clear Data</button>
          </div>
        </div>

        <div className="w-full relative">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>
          ) : attendees.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-500"><ActivityIcon size={32} className="opacity-30"/><p>No aptitude test leads yet.</p></div>
          ) : (
            <div className="overflow-x-auto w-full custom-scrollbar pb-32"> 
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <th className="px-6 py-4">Candidate Identity</th>
                    <th className="px-6 py-4">Academic Context</th>
                    <th className="px-6 py-4">Test Status</th>
                    <th className="px-6 py-4 text-center">HR Nurture</th>
                    <th className="px-6 py-4 text-center">Tech Report</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredAttendees.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-800/20 transition-colors group">
                      
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0 border border-slate-700">{lead.fullName.charAt(0)}</div>
                          <div className="flex flex-col max-w-[200px]">
                            <p className="font-semibold text-white text-sm truncate">{lead.fullName}</p>
                            <p className="text-[11px] text-slate-400 truncate">{lead.email}</p>
                            <p className="text-[10px] text-purple-400 font-mono mt-0.5">{lead.phone}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 align-middle">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-white truncate max-w-[150px]">{lead.collegeName || 'N/A'}</span>
                            <span className="text-[10px] text-slate-400">{lead.qualification || 'N/A'}</span>
                            <span className="text-[10px] text-slate-500 mt-1">{lead.city}, {lead.state}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 align-middle">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${lead.status.toLowerCase() === 'passed' ? 'bg-emerald-500/10 text-emerald-400' : lead.status.toLowerCase() === 'disqualified' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>{lead.status}</span>
                            <span className="text-xs font-bold text-white">{lead.score} <span className="text-slate-500 font-medium text-[10px]">/50</span></span>
                          </div>
                          <div className="flex items-center">
                            {lead.cheatWarnings === 0 ? <span className="text-[10px] font-medium text-emerald-500 flex items-center gap-1"><ShieldCheck size={12}/> Clean</span> : lead.cheatWarnings === 1 ? <span className="text-[10px] font-medium text-amber-500 flex items-center gap-1"><AlertTriangle size={12}/> 1 Warning</span> : <span className="text-[10px] font-medium text-rose-500 flex items-center gap-1"><Ban size={12}/> Disqualified</span>}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 align-middle bg-purple-500/[0.02]">
                        <div className="flex justify-center items-center gap-4">
                          <div className="flex flex-col items-center gap-1"><Mail size={14} className="text-slate-500"/><span className="text-[11px] font-black text-white">{lead.emailSent}</span></div>
                          <div className="flex flex-col items-center gap-1"><MessageSquare size={14} className="text-emerald-500"/><span className="text-[11px] font-black text-emerald-400">{lead.whatsappSent}</span></div>
                          <div className="flex flex-col items-center gap-1"><Phone size={14} className="text-purple-500"/><span className="text-[11px] font-black text-purple-400">{lead.voiceCallCount}</span></div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 align-middle text-center">
                         <button 
                            onClick={() => setReportModal({isOpen: true, lead: lead})}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold uppercase transition-colors border border-slate-700"
                         >
                            <Eye size={12}/> MCQ Report
                         </button>
                      </td>

                      <td className="px-6 py-4 align-middle text-right">
                        <div className="relative inline-block text-left">
                          <button onClick={() => setActiveMenu(activeMenu === lead.id ? null : lead.id)} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700">
                            <Bot size={16} />
                          </button>
                          {activeMenu === lead.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)}></div>
                              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-slate-800 border border-slate-700 shadow-2xl z-50 overflow-hidden">
                                 <div className="px-3 py-2 bg-slate-900 border-b border-slate-700"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">HR AI Action</p></div>
                                 <div className="py-1">
                                    <button onClick={() => handleGenerateDraft(lead, 'email')} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors"><Mail size={14}/> Draft Email</button>
                                    <button onClick={() => handleGenerateDraft(lead, 'whatsapp')} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-emerald-600 hover:text-white flex items-center gap-3 transition-colors"><MessageSquare size={14}/> Draft WhatsApp</button>
                                    <button onClick={() => handleGenerateDraft(lead, 'call')} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-purple-600 hover:text-white flex items-center gap-3 transition-colors border-t border-slate-700"><Phone size={14}/> AI Call Script</button>
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

      {draftModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="bg-slate-800 p-5 border-b border-slate-700 flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${draftModal.type==='email'?'bg-blue-500/20 text-blue-400':draftModal.type==='whatsapp'?'bg-emerald-500/20 text-emerald-400':'bg-purple-500/20 text-purple-400'}`}>
                      {draftModal.type === 'email' ? <Mail size={18}/> : draftModal.type === 'whatsapp' ? <MessageSquare size={18}/> : <Phone size={18}/>}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Review & Edit {draftModal.type.toUpperCase()}</h3>
                      <p className="text-xs text-slate-400">To: {draftModal.lead?.fullName} ({draftModal.lead?.phone})</p>
                    </div>
                 </div>
                 <button onClick={() => setDraftModal({isOpen: false, type: '', lead: null})} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors"><X size={18} /></button>
              </div>

              <div className="p-5 flex-grow overflow-y-auto bg-slate-950">
                 {isDrafting ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-4 text-purple-400">
                      <Bot className="w-12 h-12 animate-pulse" />
                      <p className="text-sm font-bold tracking-widest uppercase animate-pulse">Manee 2.5 Flash Generating...</p>
                    </div>
                 ) : (
                    <textarea 
                      className="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none leading-relaxed resize-none custom-scrollbar"
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                    />
                 )}
              </div>

              <div className="bg-slate-800 p-4 border-t border-slate-700 flex justify-end gap-3 shrink-0">
                 <button onClick={() => setDraftModal({isOpen: false, type: '', lead: null})} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                 <button 
                   onClick={handlePublishDraft}
                   disabled={isDrafting || isPublishing}
                   className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${draftModal.type==='email'?'bg-blue-600 hover:bg-blue-500':draftModal.type==='whatsapp'?'bg-emerald-600 hover:bg-emerald-500':'bg-purple-600 hover:bg-purple-500'}`}
                 >
                   {isPublishing ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
                   Publish & {draftModal.type === 'call' ? 'Send to Telephony Engine' : 'Send'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {reportModal.isOpen && reportModal.lead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              
              <div className="bg-slate-800 p-5 border-b border-slate-700 flex justify-between items-center shrink-0">
                 <div>
                    <h3 className="font-bold text-white text-lg">Technical Assessment Report</h3>
                    <p className="text-sm text-slate-400 mt-1">Candidate: <span className="text-white font-semibold">{reportModal.lead.fullName}</span> | Score: <span className="text-white font-bold">{reportModal.lead.score}/50</span></p>
                 </div>
                 <button onClick={() => setReportModal({isOpen: false, lead: null})} className="text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-700 p-2 rounded-lg transition-colors"><X size={20} /></button>
              </div>

              <div className="p-6 flex-grow overflow-y-auto bg-slate-950 custom-scrollbar">
                 {reportModal.lead.testResponses ? (
                    <div className="space-y-4">
                       {(reportModal.lead.testResponses as TestResponse[]).map((resp, idx) => (
                          <div key={idx} className={`p-4 rounded-xl border ${resp.isCorrect ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-rose-900/10 border-rose-500/20'}`}>
                             <p className="text-white font-medium text-sm mb-3 flex items-start gap-2">
                               <span className="text-slate-500 font-mono mt-0.5">Q{idx + 1}.</span> 
                               <span className="leading-relaxed">{resp.question}</span>
                             </p>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                   <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Candidate's Answer</p>
                                   <div className={`flex items-start gap-2 text-sm ${resp.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {resp.isCorrect ? <Check size={16} className="mt-0.5 shrink-0"/> : <XCircle size={16} className="mt-0.5 shrink-0"/>}
                                      <span className="leading-tight">{resp.userAnswer}</span>
                                   </div>
                                </div>
                                {!resp.isCorrect && (
                                   <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                                      <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Correct Answer</p>
                                      <div className="flex items-start gap-2 text-sm text-emerald-400">
                                         <Check size={16} className="mt-0.5 shrink-0"/>
                                         <span className="leading-tight">{resp.correctAnswer}</span>
                                      </div>
                                   </div>
                                )}
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                       <p>No detailed response data available for this candidate.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
}