// app/dashboard/settings/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Save, User, Bell, PhoneCall, Shield, Server, Loader2, X, KeyRound } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [webhookUrl, setWebhookUrl] = useState('');
  const [fallbackNumber, setFallbackNumber] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState(true);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' }); 

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (res.ok) {
          setWebhookUrl(data.webhookUrl || '');
          setFallbackNumber(data.fallbackNumber || '');
          setEmailAlerts(data.emailAlerts ?? true);
          setWhatsappAlerts(data.whatsappAlerts ?? false);
          setWebhookLogs(data.webhookLogs ?? true);
        }
      } catch (err) {
        console.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          fallbackNumber,
          emailAlerts,
          whatsappAlerts,
          webhookLogs
        })
      });

      if (res.ok) {
        alert("Settings saved successfully to Database!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (err) {
      alert("System Error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ text: '', type: '' });

    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMessage({ text: "New passwords do not match!", type: 'error' });
      return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordMessage({ text: "Password must be at least 6 characters long.", type: 'error' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email, 
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new,
        })
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordMessage({ text: "Password updated successfully!", type: 'success' });
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setPasswordForm({ current: '', new: '', confirm: '' });
          setPasswordMessage({ text: '', type: '' });
        }, 2000);
      } else {
        setPasswordMessage({ text: data.error || "Failed to change password.", type: 'error' });
      }
    } catch (err) {
      setPasswordMessage({ text: "Server error occurred.", type: 'error' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500"/></div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 font-sans text-white relative">
      
      <div>
        <h2 className="text-2xl font-black uppercase tracking-wide text-white">System Settings</h2>
        <p className="text-sm text-slate-400 mt-1">Manage your CMS preferences and AI Telephony configuration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
              <User className="text-blue-500 w-5 h-5" />
              <h3 className="font-bold text-white tracking-wide">Admin Profile</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                  <input type="text" defaultValue={session?.user?.name || ''} disabled className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-300 opacity-70 cursor-not-allowed outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</label>
                  <input type="email" defaultValue={session?.user?.email || ''} disabled className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-300 opacity-70 cursor-not-allowed outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4">
               <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">In-House Build</span>
            </div>
            <div className="p-5 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
              <Server className="text-indigo-500 w-5 h-5" />
              <h3 className="font-bold text-white tracking-wide">Telephony Engine Settings</h3>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-xs text-slate-400 leading-relaxed">
                Configure the connection to your custom FreeSWITCH / Node.js telephony server. The CMS will silently push call triggers to this Webhook.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Engine Webhook URL (POST)</label>
                  <input 
                    type="text" 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none transition-colors" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sales Team Fallback Number (Conference)</label>
                  <div className="flex relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><PhoneCall size={14}/></span>
                    <input 
                      type="text" 
                      value={fallbackNumber}
                      onChange={(e) => setFallbackNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none transition-colors" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
              <Bell className="text-emerald-500 w-5 h-5" />
              <h3 className="font-bold text-white tracking-wide">Notifications</h3>
            </div>
            <div className="p-6 space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Email Alerts</span>
                <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative"></div>
              </label>
              
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">WhatsApp Alerts</span>
                <input type="checkbox" checked={whatsappAlerts} onChange={(e) => setWhatsappAlerts(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative"></div>
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Telephony Webhook Logs</span>
                <input type="checkbox" checked={webhookLogs} onChange={(e) => setWebhookLogs(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 relative"></div>
              </label>
            </div>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
              <Shield className="text-rose-500 w-5 h-5" />
              <h3 className="font-bold text-white tracking-wide">Security</h3>
            </div>
            <div className="p-6">
              <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full py-2.5 border border-slate-700 hover:border-slate-500 rounded-lg text-sm font-bold text-slate-300 hover:text-white transition-all bg-slate-800 hover:bg-slate-700"
              >
                Change Password
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-70 shadow-lg shadow-blue-900/20"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
              
              <div className="bg-slate-800 p-5 border-b border-slate-700 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/20 text-rose-500">
                      <KeyRound size={18}/>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Change Password</h3>
                    </div>
                 </div>
                 <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors">
                    <X size={18} />
                 </button>
              </div>

              <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                
                {passwordMessage.text && (
                  <div className={`p-3 rounded-lg text-xs font-bold ${passwordMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {passwordMessage.text}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Current Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-rose-500 outline-none transition-colors" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">New Password</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-rose-500 outline-none transition-colors" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-rose-500 outline-none transition-colors" 
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isChangingPassword}
                    className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {isChangingPassword ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                    Update Password
                  </button>
                </div>
              </form>

           </div>
        </div>
      )}

    </div>
  );
}