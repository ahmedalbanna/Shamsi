/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Zap, 
  CreditCard, 
  History, 
  User, 
  Settings, 
  AlertCircle, 
  CheckCircle2, 
  Battery, 
  Mic, 
  Home, 
  Package,
  Activity,
  ArrowLeft,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Power
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- Types ---
interface SolarPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  apps: string[];
}

interface UserStatus {
  id: string;
  name: string;
  package: string;
  totalInstallments: number;
  paidInstallments: number;
  remainingDays: number;
  status: 'active' | 'grace' | 'suspended' | 'owned';
  consumption: string;
  lastActivationCode: string;
}

// --- Components ---

const Navbar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-3 flex justify-between items-center z-50 md:top-0 md:bottom-auto md:bg-white/80 md:backdrop-blur-md">
    <NavItem icon={<Home size={20} />} label="الرئيسية" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
    <NavItem icon={<Activity size={20} />} label="طاقتي" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
    <NavItem icon={<Package size={20} />} label="الباقات" active={activeTab === 'packages'} onClick={() => setActiveTab('packages')} />
    <NavItem icon={<User size={20} />} label="حسابي" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
  </nav>
);

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 transition-colors",
      active ? "text-amber-500" : "text-stone-400 hover:text-stone-600"
    )}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const Header = () => (
  <header className="px-6 pt-8 pb-4 flex justify-between items-center max-w-5xl mx-auto md:pt-4">
    <div className="flex items-center gap-3">
      <div className="bg-amber-500 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:rotate-12 transition-transform">
        <Sun className="text-white" size={24} strokeWidth={2.5} />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-800">شمسي</h1>
        <p className="text-stone-500 text-sm">طاقة نظيفة.. بملكيتك الكاملة</p>
      </div>
    </div>
    <div className="hidden md:flex gap-4 items-center">
      <div className="bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">نظام متصل (Online)</span>
      </div>
    </div>
  </header>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<UserStatus | null>(null);
  const [packages, setPackages] = useState<SolarPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetchStatus();
    fetchPackages();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/user-status');
      const data = await res.json();
      setUser(data);
    } catch (e) {
      console.error("Failed to fetch status", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      setPackages(data);
    } catch (e) {
      console.error("Failed to fetch packages", e);
    }
  };

  const handlePayment = async () => {
    try {
      const res = await fetch('/api/pay', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setNotification({ message: `تم سداد القسط! كود التفعيل الجديد: ${data.code}`, type: 'success' });
      }
    } catch (e) {
      setNotification({ message: 'فشل السداد، حاول مرة أخرى', type: 'error' });
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Sun size={48} className="text-sun" />
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pt-12 md:pb-12">
      <Header />
      
      <main className="max-w-5xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-4"
            >
              {/* Hero Banner */}
              <div className="md:col-span-8 bg-amber-500 rounded-3xl p-8 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden flex flex-col justify-between">
                <div className="relative z-10 space-y-4">
                  <h2 className="text-3xl font-black mb-2">أهلاً بك يا {user?.name.split(' ')[0]}</h2>
                  <p className="text-white/90 text-sm mb-6 max-w-xs">أنت الآن تستمتع بنظافة الطاقة المتجددة بملكيتك الكاملة.</p>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="bg-white text-amber-600 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm hover:bg-stone-50 transition-colors w-max"
                  >
                    عرض حالة النظام
                  </button>
                </div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-400 rounded-full opacity-30"></div>
              </div>

              {/* Quick Actions */}
              <div className="md:col-span-4 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col justify-center">
                <h3 className="font-bold text-stone-800 mb-4">طرق الدفع السريع</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center gap-2 hover:border-amber-400 transition-all cursor-pointer">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                      <Smartphone size={24} />
                    </div>
                    <span className="text-xs font-bold text-stone-700">شحن رصيد</span>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center gap-2 hover:border-amber-400 transition-all cursor-pointer">
                    <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                      <CreditCard size={24} />
                    </div>
                    <span className="text-xs font-bold text-stone-700">دفع مباشر</span>
                  </div>
                </div>
              </div>

              {/* Voice Feature Placeholder */}
              <div className="md:col-span-12 bg-emerald-50 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between border-2 border-dashed border-emerald-200 shadow-sm gap-4">
                <div className="flex items-center gap-6">
                  <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse shrink-0">
                    <Mic size={32} />
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-emerald-900 mb-1">تحتاج مساعدة؟</h3>
                    <p className="text-emerald-700 text-sm">اضغط للتحدث معنا.. واطلب باقتك أو الدفع بصوتك.</p>
                  </div>
                </div>
                <button className="whitespace-nowrap bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-transform active:scale-95 shadow-md">
                  ابدأ التحدث
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'dashboard' && user && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-4"
            >
              <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-lg text-stone-800">حالة النظام</h2>
                  <div className={cn(
                    "px-4 py-2 rounded-full text-xs font-medium border flex items-center gap-2 shadow-sm",
                    user.status === 'active' ? "bg-white border-stone-200 text-stone-800" : "bg-red-50 text-red-600 border-red-100"
                  )}>
                    <div className={cn("w-2 h-2 rounded-full", user.status === 'active' ? "bg-emerald-500" : "bg-red-500")}></div>
                    {user.status === 'active' ? 'نظام متصل (Online)' : 'قيد الانتظار'}
                  </div>
                </div>

                {/* Circular Gauge Placeholder */}
                <div className="flex justify-center py-4 relative">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="84" className="stroke-stone-100" strokeWidth="14" fill="transparent" />
                      <circle 
                        cx="96" cy="96" r="84" 
                        className="stroke-amber-500" 
                        strokeWidth="14" 
                        fill="transparent" 
                        strokeDasharray={528} 
                        strokeDashoffset={528 - (528 * user.remainingDays / 30)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-black text-stone-900">{user.remainingDays}</span>
                      <span className="text-xs text-stone-500 font-bold uppercase tracking-wider mt-1">يوم متبقي</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-6">
                  <div className="space-y-1">
                    <p className="text-stone-400 text-[10px] font-bold uppercase font-sans">الاستهلاك اللحظي</p>
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-amber-500" />
                      <span className="font-bold text-stone-800 font-mono">{user.consumption}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-stone-400 text-[10px] font-bold uppercase font-sans">قوة البطارية</p>
                    <div className="flex items-center gap-2">
                      <Battery size={16} className="text-emerald-500" />
                      <span className="font-bold text-emerald-600 font-mono">92%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-2xl p-4 flex justify-between items-center mt-2 border border-stone-100">
                  <div>
                    <p className="text-stone-400 text-[10px] font-bold uppercase">كود التفعيل الأخير</p>
                    <p className="font-mono font-bold text-stone-700 tracking-widest">{user.lastActivationCode}</p>
                  </div>
                  <button className="text-amber-500 p-2 hover:bg-amber-100 rounded-full transition-colors">
                    <History size={20} />
                  </button>
                </div>
              </div>

              {/* Installment Progress */}
              <div className="md:col-span-5 bg-stone-900 rounded-3xl p-6 text-white shadow-xl space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-stone-400 text-sm mb-4">تقدم الملكية</h3>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-5xl font-bold">{Math.round((user.paidInstallments / user.totalInstallments) * 100)}%</p>
                  </div>
                  <div className="h-3 w-full bg-stone-800 rounded-full overflow-hidden mb-3">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(user.paidInstallments / user.totalInstallments) * 100}%` }}
                      className="h-full bg-amber-500"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 uppercase">باقي {user.totalInstallments - user.paidInstallments} قسط لتملك النظام تماماً</p>
                </div>
                
                <div className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700/50">
                  <p className="text-xs text-stone-400 mb-1 tracking-wider uppercase">القسط القادم</p>
                  <p className="text-2xl font-bold text-white mb-5">4,500 <span className="text-sm font-normal text-stone-400">ر.ي</span></p>
                  <button 
                    onClick={handlePayment}
                    className="w-full bg-white text-amber-600 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-stone-200 active:scale-95 transition-all"
                  >
                    ادفع الآن
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'packages' && (
            <motion.div 
              key="packages"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold px-2 text-stone-800">اكتشف باقات شمسي</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4 relative overflow-hidden group flex flex-col">
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <h3 className="text-lg font-bold text-stone-900">{pkg.name}</h3>
                        <p className="text-stone-500 text-sm">{pkg.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-500 font-black text-xl leading-none">{pkg.price}$</p>
                        <p className="text-stone-400 text-[10px]">دفعة أولى</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 relative z-10 flex-grow py-4 border-t border-b border-stone-50 my-2">
                      <p className="text-xs font-bold text-stone-400 uppercase">تشغل لك:</p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.apps.map(app => (
                          <span key={app} className="bg-stone-50 px-3 py-1 rounded-full text-xs text-stone-600 border border-stone-200">
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold text-sm transition-all group-hover:bg-amber-500 group-hover:text-stone-900 shadow-lg group-hover:shadow-amber-500/20 mt-auto">
                      اطلب الأن
                    </button>
                    <Sun size={120} className="absolute -bottom-10 -left-10 text-stone-50 transition-colors group-hover:text-amber-500/10" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 text-center"
            >
              <div className="md:col-span-12 lg:col-span-5 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4 h-full flex flex-col justify-center relative overflow-hidden">
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto relative z-10">
                  <User size={48} className="text-amber-500" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-stone-800">{user?.name}</h2>
                  <p className="text-stone-500 text-sm mt-1">مستفيد - صنعاء، الروضة</p>
                </div>
                <div className="flex justify-center gap-4 py-4 relative z-10">
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex flex-col items-center w-28">
                    <Sun size={20} className="text-amber-500 mb-2" />
                    <span className="text-[10px] text-stone-500 uppercase">الولاء</span>
                    <span className="font-bold text-sm text-stone-700 mt-1">بلاتيني</span>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex flex-col items-center w-28">
                    <ShieldCheck size={20} className="text-emerald-500 mb-2" />
                    <span className="text-[10px] text-stone-500 uppercase">الضمان</span>
                    <span className="font-bold text-sm text-stone-700 mt-1">نشط</span>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full"></div>
              </div>

              <div className="md:col-span-12 lg:col-span-7 flex flex-col gap-4 text-right">
                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex-grow">
                  <ProfileItem icon={<Settings size={20} />} label="إعدادات الحساب" />
                  <ProfileItem icon={<CreditCard size={20} />} label="وسائل الدفع" />
                  <ProfileItem icon={<Smartphone size={20} />} label="أجهزة التحكم" />
                  <ProfileItem icon={<AlertCircle size={20} />} label="مركز المساعدة" className="text-red-500" />
                </div>
                <button className="text-stone-400 text-sm font-medium hover:text-stone-600 transition-colors py-2">تسجيل الخروج</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed top-6 left-6 right-6 z-[60] flex justify-center"
          >
            <div className={cn(
              "p-4 rounded-2xl shadow-2xl flex items-center gap-3 border w-full max-w-sm",
              notification.type === 'success' ? "bg-white border-emerald-100" : "bg-white border-red-100"
            )}>
              {notification.type === 'success' ? (
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
              ) : (
                <div className="bg-red-100 p-2 rounded-full text-red-600">
                  <AlertCircle size={20} />
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs font-bold text-stone-800 leading-tight">{notification.message}</p>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <ArrowLeft size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ProfileItem = ({ icon, label, className }: { icon: React.ReactNode, label: string, className?: string }) => (
  <button className={cn(
    "w-full flex items-center justify-between p-5 border-b border-stone-100 last:border-none hover:bg-stone-50 active:bg-stone-100 transition-colors text-stone-700",
    className
  )}>
    <div className="flex items-center gap-3">
      <span className="text-stone-400">{icon}</span>
      <span className="font-bold text-sm tracking-wide">{label}</span>
    </div>
    <ChevronRight size={18} className="text-stone-300" />
  </button>
);
