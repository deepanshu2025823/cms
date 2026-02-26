// app/dashboard/layout.tsx

'use client';

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, LogOut, Settings, 
  Menu, X, Bell, UserCircle, ChevronDown, CheckCircle2, AlertTriangle, Info,
  Briefcase 
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
         headers: { 'Cache-Control': 'no-cache' } 
      });
      if (res.ok) {
         const data = await res.json();
         setNotifications(data);
      }
    } catch (err) {
      console.error("Notifications sync failed");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ id })
    });
    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const NavLinks = () => (
    <>
      <Link 
        href="/dashboard" 
        onClick={() => setIsMobileMenuOpen(false)} 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/dashboard' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="font-bold text-sm tracking-wide">Scholarship Test</span>
      </Link>
      
      <Link 
        href="/dashboard/aptitude" 
        onClick={() => setIsMobileMenuOpen(false)} 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/dashboard/aptitude' ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.1)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
      >
        <Briefcase className="w-5 h-5" />
        <span className="font-bold text-sm tracking-wide">College Hiring</span>
      </Link>

      <Link 
        href="/dashboard/roles" 
        onClick={() => setIsMobileMenuOpen(false)} 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/dashboard/roles' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
      >
        <Users className="w-5 h-5" />
        <span className="font-bold text-sm tracking-wide">Role Management</span>
      </Link>
      
      <Link 
        href="/dashboard/settings" 
        onClick={() => setIsMobileMenuOpen(false)} 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/dashboard/settings' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
      >
        <Settings className="w-5 h-5" />
        <span className="font-bold text-sm tracking-wide">Settings</span>
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white flex font-sans overflow-hidden">
      <aside className="w-64 bg-[#0b0f1f] border-r border-white/10 flex-col hidden lg:flex relative z-20">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="bg-white p-1 rounded-lg shrink-0">
            <Image src="https://www.careerlabconsulting.com/favicon.ico" alt="Logo" width={28} height={28} />
          </div>
          <div>
            <h2 className="font-black text-base uppercase tracking-widest text-white leading-tight">InternX CMS</h2>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{(session?.user as any)?.role || 'Super Admin'}</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <NavLinks />
        </nav>
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex">
           <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)}></div>
           <aside className="w-72 bg-[#0b0f1f] border-r border-white/10 flex-col flex relative z-50 animate-in slide-in-from-left duration-300 h-full shadow-2xl">
             <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-1 rounded-lg shrink-0">
                    <Image src="https://www.careerlabconsulting.com/favicon.ico" alt="Logo" width={24} height={24} />
                  </div>
                  <h2 className="font-black text-sm uppercase tracking-widest text-white">InternX</h2>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white bg-white/5 p-2 rounded-lg transition-colors"><X size={20}/></button>
             </div>
             <nav className="flex-1 p-4 space-y-2 mt-2">
                <NavLinks />
             </nav>
             <div className="p-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase text-center tracking-widest">&copy; 2026 Career Lab CMS</p>
             </div>
           </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 bg-[#0b0f1f]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-slate-400 hover:text-white p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg lg:text-xl font-black text-white uppercase tracking-wide hidden sm:block">
              {pathname === '/dashboard' ? 'Scholarship Dashboard' : 
               pathname === '/dashboard/aptitude' ? 'Aptitude Test Hiring' :
               pathname === '/dashboard/roles' ? 'Role Management' :
               pathname === '/dashboard/settings' ? 'Settings' :
               pathname === '/dashboard/profile' ? 'My Profile' : 'DASHBOARD'}
            </h1>
          </div>

          <div className="flex items-center gap-3 lg:gap-6 relative">
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsProfileOpen(false);
                }}
                className={`relative p-2.5 rounded-full transition-all ${isNotificationOpen ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0b0f1f] animate-pulse"></span>
                )}
              </button>

              {isNotificationOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsNotificationOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-white/10 bg-white/[0.02] flex justify-between items-center">
                      <h3 className="font-bold text-white">Notifications</h3>
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 text-xs italic">No new alerts found.</div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => markAsRead(notif.id)}
                            className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-blue-500/5' : ''}`}
                          >
                            <div className="mt-1 shrink-0">
                              {notif.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                              {notif.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                              {notif.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                            </div>
                            <div className="flex-1">
                              <h4 className={`text-sm mb-0.5 ${!notif.read ? 'font-black text-white' : 'font-bold text-slate-300'}`}>{notif.title}</h4>
                              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{notif.desc}</p>
                              <span className="text-[10px] text-slate-600 mt-2 block">{new Date(notif.createdAt).toLocaleString()}</span>
                            </div>
                            {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
            
            <div className="relative">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 p-1 pr-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-inner shadow-black/20">
                  {session?.user?.name?.charAt(0) || 'A'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-black text-white leading-none tracking-wide">{session?.user?.name || 'Admin User'}</span>
                  <span className="text-[9px] text-blue-400 mt-1 font-black uppercase tracking-widest leading-none">{(session?.user as any)?.role || 'Super Admin'}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 hidden sm:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-52 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl z-30 py-2 animate-in fade-in slide-in-from-top-2">
                    <Link href="/dashboard/profile" onClick={() => setIsProfileOpen(false)} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-3">
                      <UserCircle className="w-4 h-4" /> My Profile
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 mt-1 border-t border-white/5 pt-3">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#020617] p-4 lg:p-10 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}