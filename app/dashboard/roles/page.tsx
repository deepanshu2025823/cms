// app/dashboard/roles/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Shield, Mail, Trash2, Loader2, X, ShieldCheck, Key } from 'lucide-react';

export default function RoleManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    roleName: 'STAFF',
    permissions: 'view_report' 
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load users");
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setShowModal(false);
      fetchUsers();
      alert("New Admin access granted!");
    } else {
      const err = await res.json();
      alert(err.error || "Failed to create account");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-0">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Access Control</h1>
          <p className="text-slate-400 text-sm mt-1">Manage relational roles and administrative permissions.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/40"
        >
          <UserPlus size={18} /> Add New Admin
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user: any) => (
            <div key={user.id} className="bg-[#0b0f1f] border border-white/10 p-6 rounded-3xl relative group overflow-hidden transition-all hover:border-blue-500/30">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-2xl rounded-full" />
               <div className="flex items-start justify-between relative z-10 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <ShieldCheck size={28} />
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border ${
                    user.role?.name === 'SUPER_ADMIN' 
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {user.role?.name || 'NO ROLE'}
                  </span>
               </div>
               
               <h3 className="font-bold text-lg text-white">{user.name}</h3>
               <p className="text-slate-500 text-xs flex items-center gap-2 mt-1 truncate">
                 <Mail size={12} className="shrink-0" /> {user.email}
               </p>

               <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">
                    Added: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  <button className="text-red-500/30 hover:text-red-500 transition-all p-2 hover:bg-red-500/10 rounded-lg">
                    <Trash2 size={16}/>
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f1f] border border-white/10 w-full max-w-md p-8 rounded-[2.5rem] relative animate-in zoom-in-95 shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
              <X size={24}/>
            </button>
            
            <h2 className="text-2xl font-black mb-8 text-white uppercase tracking-tighter flex items-center gap-3">
              <Key className="text-blue-500" /> Create Access
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Full Name</label>
                <input type="text" required placeholder="Deepanshu Joshi" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-blue-500 outline-none transition-all" onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Email Address</label>
                <input type="email" required placeholder="name@careerlab.com" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-blue-500 outline-none transition-all" onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Temporary Password</label>
                <input type="password" required placeholder="••••••••" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-blue-500 outline-none transition-all" onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              <div className="space-y-1 pb-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Security Role</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none" 
                  onChange={e => setFormData({...formData, roleName: e.target.value})}
                  value={formData.roleName}
                >
                  <option value="STAFF" className="bg-[#0b0f1f]">STAFF (Limited View)</option>
                  <option value="MANAGER" className="bg-[#0b0f1f]">MANAGER (Full View + Export)</option>
                  <option value="SUPER_ADMIN" className="bg-[#0b0f1f]">SUPER ADMIN (Root Control)</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all hover:bg-slate-200 active:scale-[0.98] mt-2">
                Authorize Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}