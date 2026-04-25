/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, Zap, CreditCard, History, User, Settings, AlertCircle, CheckCircle2, Battery, Mic, Home, Package, Activity, ArrowLeft, Smartphone, ChevronRight, ShieldCheck, Power, LineChart, Wrench, Edit3, Save, X, Plus, Minus, CheckSquare, Square, Share2, Bell, Lightbulb, Calculator, ThumbsUp, Gift, Sparkles, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, YAxis } from 'recharts';

// --- Types ---
interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'alert' | 'info' | 'success';
}

interface SolarPackage {

  id: string;
  name: string;
  price: number;
  basePrice: number;
  installment: number;
  description: string;
  apps: string[];
  customizable: CustomizationOption[];
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: string;
}

interface MaintenanceRecord {
  id: string;
  date: string;
  type: string;
  status: string;
  technician: string;
}

interface ConsumptionDataPoint {
  time: string;
  value: number;
}

interface UserStatus {
  id: string;
  name: string;
  email: string;
  phone: string;
  packageId: string;
  packageName: string;
  totalInstallments: number;
  paidInstallments: number;
  remainingDays: number;
  status: 'active' | 'grace' | 'suspended' | 'owned';
  consumption: string;
  batteryLevel: number;
  voltage: string;
  lastActivationCode: string;
  referralCode: string;
  creditBalance: number;
  systemDetails: {
    panels: string;
    battery: string;
    inverter: string;
    installedDate: string;
  };
  paymentHistory: PaymentRecord[];
  maintenanceLogs: MaintenanceRecord[];
  consumptionData: ConsumptionDataPoint[];
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

const Header = ({ onOpenNotifications, unreadCount }: { onOpenNotifications: () => void, unreadCount: number }) => (
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
    <div className="flex gap-4 items-center">
      <div className="hidden md:flex bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm items-center gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">نظام متصل (Online)</span>
      </div>
      <button 
        onClick={onOpenNotifications} 
        className="relative bg-white p-3 rounded-xl border border-stone-200 shadow-sm hover:border-amber-400 transition-all text-stone-600"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  </header>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<UserStatus | null>(null);
  const [packages, setPackages] = useState<SolarPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Features states
  const [isRecording, setIsRecording] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('تطبيق حوِّل');
  const [comparingPackages, setComparingPackages] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  
  // Profile sub-views
  const [profileView, setProfileView] = useState<'main' | 'history' | 'maintenance' | 'edit' | 'referral'>('main');
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' });
  const [referralCodeInput, setReferralCodeInput] = useState('');

  // Customization
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string[]>>({});

  // New Features States
  const [showNotificationsList, setShowNotificationsList] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'n1', title: 'تذكير بالسداد', message: 'بقيت 3 أيام على موعد قسطك القادم. سدد الآن لتجنب تقليل الطاقة.', date: 'اليوم', read: false, type: 'alert' },
    { id: 'n2', title: 'تسجيل الدخول', message: 'تم إطلاق ميزة حاسبة التوفير الجديدة!', date: 'أمس', read: false, type: 'info' },
    { id: 'n3', title: 'صيانة دورية', message: 'سيقوم الفني بزيارتك يوم الخميس لتنظيف ألواحك الشمسية.', date: 'قبل يومين', read: true, type: 'info' }
  ]);
  
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'proposal'>('idle');
  
  const [simData, setSimData] = useState({ lights: 4, hours: 6, hasTv: false, hasFridge: false });
  const dieselPricePerLiter = 1200; // Yemen Riyal
  const estimatedDieselMonthly = ((simData.lights * 0.1) + (simData.hasTv ? 0.5 : 0) + (simData.hasFridge ? 1 : 0)) * simData.hours * 30 * dieselPricePerLiter;
  const estimatedShamsiMonthly = 18000; // Average installment
  const simulatedSavings = Math.max(0, Math.round(estimatedDieselMonthly - estimatedShamsiMonthly));

  useEffect(() => {
    fetchStatus();
    fetchPackages();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/user-status');
      const data = await res.json();
      setUser(data);
      setEditForm({ name: data.name, phone: data.phone, email: data.email });
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
      const res = await fetch('/api/pay', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: selectedPaymentMethod, amount: 4500, useCredit: true })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setNotification({ message: `تم سداد القسط عبر ${selectedPaymentMethod}! كود التفعيل: ${data.code}`, type: 'success' });
        setShowPaymentModal(false);
      }
    } catch (e) {
      setNotification({ message: 'فشل السداد، حاول مرة أخرى', type: 'error' });
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setNotification({ message: 'تم تحديث البيانات بنجاح', type: 'success' });
        setProfileView('main');
      }
    } catch (e) {
      setNotification({ message: 'فشل التحديث', type: 'error' });
    }
  };

  const handleApplyReferral = async () => {
    if (!referralCodeInput) return;
    try {
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: referralCodeInput })
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ message: data.message, type: 'success' });
        setReferralCodeInput('');
      }
    } catch (e) {
      setNotification({ message: 'الكود غير صالح', type: 'error' });
    }
  };

  const toggleCompare = (pkgId: string) => {
    setComparingPackages(prev => 
      prev.includes(pkgId) ? prev.filter(id => id !== pkgId) : [...prev, pkgId]
    );
  };

  const toggleCustomization = (pkgId: string, customId: string) => {
    setSelectedCustomizations(prev => {
      const pkgCustoms = prev[pkgId] || [];
      const newCustoms = pkgCustoms.includes(customId) 
        ? pkgCustoms.filter(id => id !== customId)
        : [...pkgCustoms, customId];
      return { ...prev, [pkgId]: newCustoms };
    });
  };

  const calculateTotalPrice = (pkg: SolarPackage) => {
    const pkgCustoms = selectedCustomizations[pkg.id] || [];
    const extrasPrice = pkgCustoms.reduce((acc, customId) => {
      const opt = pkg.customizable.find(c => c.id === customId);
      return acc + (opt ? opt.price : 0);
    }, 0);
    return pkg.price + extrasPrice;
  };

  const handleVoiceClick = () => {
    if (voiceStatus === 'idle') {
      setVoiceStatus('listening');
      // Simulate Voice -> AI Processing
      setTimeout(() => setVoiceStatus('processing'), 3000);
      setTimeout(() => setVoiceStatus('proposal'), 6000);
    } else {
      setVoiceStatus('idle');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-stone-50">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Sun size={48} className="text-amber-500" />
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pt-12 md:pb-12">
      <Header 
        onOpenNotifications={() => {
          setShowNotificationsList(true);
          markNotificationsAsRead();
        }} 
        unreadCount={unreadCount} 
      />
      
      <main className="max-w-5xl mx-auto px-6 relative">
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
              <div className="md:col-span-8 bg-amber-500 rounded-3xl p-8 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden flex flex-col justify-between min-h-[240px]">
                <div className="relative z-10 space-y-4">
                  <h2 className="text-3xl font-black mb-2">أهلاً بك يا {user?.name.split(' ')[0]}</h2>
                  <p className="text-white/90 text-sm mb-6 max-w-xs leading-relaxed">أنت الآن تستمتع بنظافة الطاقة المتجددة بملكيتك الكاملة.</p>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="bg-white text-amber-600 px-6 py-3 rounded-2xl font-bold text-sm shadow-md hover:bg-stone-50 transition-colors w-max"
                  >
                    عرض حالة النظام
                  </button>
                </div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-400 rounded-full opacity-30"></div>
                <div className="absolute top-8 left-8 bg-white/20 backdrop-blur-md rounded-2xl p-4 hidden md:flex flex-col items-end shadow-sm border border-white/20">
                  <span className="text-xs uppercase tracking-wider opacity-90 mb-1">الرصيد المتبقي</span>
                  <span className="text-3xl font-black">{user?.remainingDays} <span className="text-lg opacity-80 font-normal">يوم</span></span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="md:col-span-4 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm flex flex-col justify-center">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center justify-between">
                  طرق الدفع السريع
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">رصيد متاح: {user?.creditBalance} ر.ي</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => { setSelectedPaymentMethod('محفظة حوِّل'); setShowPaymentModal(true); }}
                    className="bg-stone-50 p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center gap-3 hover:border-amber-400 transition-all cursor-pointer text-center hover:bg-white"
                  >
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                      <Smartphone size={20} />
                    </div>
                    <span className="text-[11px] font-bold text-stone-700">محفظة حوِّل</span>
                  </div>
                  <div 
                    onClick={() => { setSelectedPaymentMethod('كارت شحن'); setShowPaymentModal(true); }}
                    className="bg-stone-50 p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center gap-3 hover:border-amber-400 transition-all cursor-pointer text-center hover:bg-white"
                  >
                    <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                      <CreditCard size={20} />
                    </div>
                    <span className="text-[11px] font-bold text-stone-700">كارت شحن</span>
                  </div>
                </div>
              </div>

              {/* Voice AI Ordering Feature */}
              <div className="md:col-span-12 bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden transition-all">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none"></div>
                
                <AnimatePresence mode="wait">
                  {voiceStatus === 'idle' && (
                    <motion.div 
                      key="idle"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col md:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-6 w-full md:w-auto">
                        <button 
                          onClick={handleVoiceClick}
                          className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 hover:scale-105 transition-all shrink-0 relative"
                        >
                          <Mic size={32} />
                          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                        </button>
                        <div className="text-right flex-1">
                          <h3 className="text-xl font-bold text-stone-900 mb-1 flex items-center gap-2">
                            <Sparkles size={18} className="text-amber-500" />
                            طلب ذكي بالصوت
                          </h3>
                          <p className="text-stone-500 text-sm">
                            اضغط لتتحدث. قل مثلاً: "أحتاج باقة لتشغيل مراوح وثلاجة" وسنقترح الأنسب.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {(voiceStatus === 'listening' || voiceStatus === 'processing') && (
                    <motion.div 
                      key="listening"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col md:flex-row items-center justify-between gap-4 bg-emerald-50 p-4 rounded-2xl"
                    >
                      <div className="flex items-center gap-6 w-full md:w-auto">
                        <button 
                          onClick={handleVoiceClick}
                          className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30 animate-pulse shrink-0"
                        >
                          <Square size={24} fill="currentColor" />
                        </button>
                        <div className="text-right flex-1">
                          <h3 className="text-xl font-bold text-emerald-900 mb-1">
                            {voiceStatus === 'listening' ? 'جاري الاستماع...' : 'الذكاء الاصطناعي يحلل طلبك...'}
                          </h3>
                          <p className="text-emerald-700 text-sm">
                            {voiceStatus === 'listening' ? 'تحدث بوضوح عن احتياجاتك.' : 'يبحث عن أفضل باقة لك...'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 h-12 items-center px-4">
                        {[1, 1.5, 2, 2.5, 2, 1.5, 1, 1.8, 1.2].map((mod, i) => (
                          <motion.div 
                            key={i} 
                            className="w-2 bg-emerald-500 rounded-full"
                            animate={{ height: voiceStatus === 'listening' ? ['20%', '100%', '20%'] : '40%' }}
                            transition={{ duration: 0.5 * (i % 3 + 1), repeat: Infinity, ease: 'linear' }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {voiceStatus === 'proposal' && (
                    <motion.div 
                      key="proposal"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-white border-2 border-emerald-400 rounded-2xl p-6 relative"
                    >
                      <button onClick={handleVoiceClick} className="absolute top-4 left-4 text-stone-400 hover:text-stone-600"><X size={20}/></button>
                      <div className="flex items-start gap-4">
                        <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 shrink-0">
                          <MessageSquare size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-stone-900 mb-2">اقتراح الذكاء الاصطناعي</h4>
                          <p className="text-stone-600 text-sm leading-relaxed border-b border-stone-100 pb-4 mb-4">
                            "لقد فهمت أنك تريد تشغيل <strong>مروحتين وتلفزيون صغير بالإضافة للإنارة</strong>. الباقة الأنسب لك هي <strong>باقة العيلة</strong>، وهي متوفرة بالتقسيط بـ 4500 ريال أسبوعياً."
                          </p>
                          <div className="flex gap-3">
                             <button onClick={() => { setActiveTab('packages'); setVoiceStatus('idle'); }} className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition">
                               مشاهدة الباقة المقترحة
                             </button>
                             <button onClick={handleVoiceClick} className="bg-stone-100 text-stone-700 px-6 py-2 rounded-xl text-sm font-bold hover:bg-stone-200 transition">
                               إلغاء
                             </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Solar Savings Simulator */}
              <div className="md:col-span-12 bg-stone-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-8">
                 <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none"></div>
                 
                 <div className="md:w-1/2 space-y-6 relative z-10">
                   <div>
                     <h3 className="text-2xl font-black text-amber-500 flex items-center gap-2 mb-2">
                       <Calculator size={24} />
                       حاسبة التوفير
                     </h3>
                     <p className="text-stone-400 text-sm">أدخل أجهزتك لنحسب لك التوفير الشهري مقارنة بالمولدات (الديزل).</p>
                   </div>
                   
                   <div className="space-y-4">
                     <div>
                       <label className="flex justify-between text-xs font-bold text-stone-300 mb-2">
                         <span>عدد اللمبات (الإضاءة)</span>
                         <span className="text-amber-500">{simData.lights}</span>
                       </label>
                       <input type="range" min="1" max="20" value={simData.lights} onChange={e => setSimData({...simData, lights: parseInt(e.target.value)})} className="w-full accent-amber-500" />
                     </div>
                     <div>
                       <label className="flex justify-between text-xs font-bold text-stone-300 mb-2">
                         <span>ساعات التشغيل باليوم</span>
                         <span className="text-amber-500">{simData.hours}</span>
                       </label>
                       <input type="range" min="2" max="24" value={simData.hours} onChange={e => setSimData({...simData, hours: parseInt(e.target.value)})} className="w-full accent-amber-500" />
                     </div>
                     <div className="flex gap-4">
                       <label className="flex items-center gap-2 text-sm text-stone-300 cursor-pointer">
                          <input type="checkbox" checked={simData.hasTv} onChange={e => setSimData({...simData, hasTv: e.target.checked})} className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 bg-stone-800 border-stone-700" />
                          تلفزيون / رسيفر
                       </label>
                       <label className="flex items-center gap-2 text-sm text-stone-300 cursor-pointer">
                          <input type="checkbox" checked={simData.hasFridge} onChange={e => setSimData({...simData, hasFridge: e.target.checked})} className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 bg-stone-800 border-stone-700" />
                          ثلاجة صغيرة
                       </label>
                     </div>
                   </div>
                 </div>

                 <div className="md:w-1/2 flex items-center justify-center relative z-10">
                   <div className="bg-stone-800 border border-stone-700 p-6 rounded-3xl w-full text-center">
                     <p className="text-stone-400 text-sm mb-2">التوفير الشهري التقديري</p>
                     <p className="text-5xl font-black text-white mb-2">
                       {simulatedSavings.toLocaleString()} <span className="text-xl text-stone-400 font-normal">ر.ي</span>
                     </p>
                     <p className="text-xs text-stone-500 mt-4 leading-relaxed">
                       كلفة الديزل المتوقعة: <span className="line-through text-red-400">{Math.round(estimatedDieselMonthly).toLocaleString()}</span><br/>
                       كلفة قسط شمسي الثابتة: <span className="text-emerald-400">{estimatedShamsiMonthly.toLocaleString()}</span>
                     </p>
                   </div>
                 </div>
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

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Battery SVG Animation */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="relative w-24 h-48 border-[6px] border-stone-200 rounded-3xl overflow-hidden mb-2">
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-stone-300 rounded-b-md z-10"></div>
                       <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${user.batteryLevel}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={cn(
                            "absolute bottom-0 left-0 right-0 rounded-b-xl transition-colors",
                            user.batteryLevel > 20 ? "bg-emerald-500" : "bg-red-500"
                          )}
                       >
                         {/* Bubble animation inside battery */}
                         <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden opacity-30">
                            {[1,2,3,4].map(i => (
                              <motion.div 
                                key={i}
                                className="absolute bg-white rounded-full w-2 h-2"
                                style={{ left: `${Math.random() * 80 + 10}%` }}
                                animate={{ y: ['100%', '-100%'] }}
                                transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: Math.random() }}
                              />
                            ))}
                         </div>
                       </motion.div>
                       <div className="absolute inset-0 flex items-center justify-center z-10">
                         <span className={cn(
                           "font-black text-2xl drop-shadow-md",
                           user.batteryLevel > 50 ? "text-white" : "text-stone-700"
                         )}>{user.batteryLevel}%</span>
                       </div>
                    </div>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">شحن البطارية</span>
                  </div>

                  {/* Consumption Chart */}
                  <div className="flex-2 flex flex-col min-w-0 flex-grow h-48 bg-stone-50 rounded-1xl p-4 border border-stone-100 relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-stone-500 uppercase">الاستهلاك اليومي (واط)</span>
                      <span className="text-sm font-black text-amber-500">{user.consumption}</span>
                    </div>
                    <div className="flex-grow w-full h-full absolute inset-0 pt-10">
                      <ResponsiveContainer width="100%" height="80%">
                        <AreaChart data={user.consumptionData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-4 mt-2">
                  <div className="bg-stone-50 rounded-2xl p-4 flex justify-between items-center border border-stone-100">
                    <div>
                      <p className="text-stone-400 text-[10px] font-bold uppercase">كود التفعيل</p>
                      <p className="font-mono font-bold text-stone-700 tracking-widest text-[11px]">{user.lastActivationCode}</p>
                    </div>
                    <button className="text-amber-500 p-2 hover:bg-amber-100 rounded-full transition-colors relative group">
                      <History size={16} />
                    </button>
                  </div>
                   <div className="bg-stone-50 rounded-2xl p-4 flex justify-between items-center border border-stone-100">
                    <div>
                      <p className="text-stone-400 text-[10px] font-bold uppercase">الجهد</p>
                      <p className="font-mono font-bold text-stone-700 tracking-widest text-[11px]">{user.voltage}</p>
                    </div>
                    <button className="text-emerald-500 p-2 hover:bg-emerald-100 rounded-full transition-colors relative group">
                      <Zap size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Installment Progress */}
              <div className="md:col-span-5 bg-stone-900 rounded-3xl p-6 text-white shadow-xl space-y-6 flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-stone-400 text-sm mb-4">تقدم الملكية</h3>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-5xl font-bold text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                      {Math.round((user.paidInstallments / user.totalInstallments) * 100)}%
                    </p>
                    <span className="text-stone-400 text-sm mb-2">أيام المتوفرة: <strong className="text-white">{user.remainingDays}</strong></span>
                  </div>
                  <div className="h-4 w-full bg-stone-800 rounded-full overflow-hidden mb-3 relative shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(user.paidInstallments / user.totalInstallments) * 100}%` }}
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-400 relative"
                    >
                      <motion.div 
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute top-0 bottom-0 w-20 bg-white/30 skew-x-12"
                      />
                    </motion.div>
                  </div>
                  <p className="text-[11px] text-stone-400 uppercase">باقي {user.totalInstallments - user.paidInstallments} قسط لتملك النظام تماماً</p>
                </div>
                
                <div className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700/50 relative z-10 backdrop-blur-sm">
                  {user.remainingDays <= 3 && (
                     <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-bounce shadow-lg shadow-red-500/50">
                       اقترب الموعد!
                     </div>
                  )}
                  <p className="text-xs text-stone-400 mb-1 tracking-wider uppercase">القسط القادم</p>
                  <p className="text-2xl font-bold text-white mb-5">4,500 <span className="text-sm font-normal text-stone-400">ر.ي</span></p>
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="w-full bg-white text-amber-600 py-3 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:bg-stone-100 active:scale-95 transition-all"
                  >
                    ادفع الآن
                  </button>
                </div>
                {/* Decorative glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
              </div>

              {/* Actionable Consumption Tips */}
              <div className="md:col-span-12 bg-amber-50 rounded-3xl p-6 border border-amber-100 shadow-sm flex flex-col md:flex-row gap-4 items-center mb-6">
                <div className="bg-amber-500/20 p-4 rounded-full text-amber-600 shrink-0">
                   <Lightbulb size={32} />
                </div>
                <div>
                   <h4 className="font-bold text-amber-900 text-lg mb-1">نصيحة ذكية للترشيد</h4>
                   <p className="text-amber-800 text-sm leading-relaxed">
                     بطاريتك أداؤها ممتاز! لتوفير طاقة أكبر للأيام الغائمة، ننصح بفصل التلفزيون من الفيش بدلاً من إغلاقه بالريموت، سيمنحك هذا 15% احتياطي إضافي.
                   </p>
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
              <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-bold text-stone-800">اكتشف باقات شمسي</h2>
                {comparingPackages.length > 1 && (
                  <button 
                    onClick={() => setShowComparison(!showComparison)}
                    className="bg-stone-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
                  >
                    {showComparison ? 'إخفاء المقارنة' : `مقارنة المحددة (${comparingPackages.length})`}
                  </button>
                )}
              </div>

              {showComparison && comparingPackages.length > 1 && (
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm overflow-x-auto">
                   <table className="w-full text-right text-sm">
                     <thead>
                       <tr className="border-b border-stone-100 italic text-stone-400">
                         <th className="pb-3 pr-2">الباقة</th>
                         <th className="pb-3 text-center">الدفعة الأولى</th>
                         <th className="pb-3 text-center">القسط الشهري</th>
                         <th className="pb-3">تشغل لك</th>
                       </tr>
                     </thead>
                     <tbody>
                       {packages.filter(p => comparingPackages.includes(p.id)).map(pkg => (
                         <tr key={`comp-${pkg.id}`} className="border-b border-stone-50 last:border-0 hover:bg-stone-50 transition-colors">
                           <td className="py-3 pr-2 font-bold text-stone-800">{pkg.name}</td>
                           <td className="py-3 text-center text-amber-600 font-bold">{pkg.price}$</td>
                           <td className="py-3 text-center text-emerald-600 font-bold">{pkg.installment} ر.ي</td>
                           <td className="py-3 text-xs text-stone-500">{pkg.apps.join(' + ')}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <div key={pkg.id} className={cn(
                    "bg-white rounded-3xl p-6 border shadow-sm relative flex flex-col transition-all",
                    comparingPackages.includes(pkg.id) ? "border-amber-400 ring-4 ring-amber-100" : "border-stone-200"
                  )}>
                    <div className="absolute top-6 left-6 z-20 cursor-pointer text-stone-300 hover:text-amber-500 transition-colors" onClick={() => toggleCompare(pkg.id)}>
                      {comparingPackages.includes(pkg.id) ? <CheckSquare size={24} className="text-amber-500" /> : <Square size={24} />}
                    </div>
                    
                    <div className="flex justify-between items-start relative z-10 mb-4 pr-8">
                      <div>
                        <h3 className="text-lg font-bold text-stone-900">{pkg.name}</h3>
                        <p className="text-stone-500 text-sm mt-1">{pkg.description}</p>
                      </div>
                      <div className="text-right shrink-0 pr-4">
                        <p className="text-amber-500 font-black text-xl leading-none">{calculateTotalPrice(pkg)}$</p>
                        <p className="text-stone-400 text-[10px] mt-1">دفعة أولى</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 relative z-10 py-4 border-t border-stone-100 my-2 flex-grow">
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase mb-2">تشغل لك أساسياً:</p>
                        <div className="flex flex-wrap gap-2">
                          {pkg.apps.map(app => (
                            <span key={app} className="bg-stone-50 px-3 py-1 rounded-full text-xs text-stone-600 border border-stone-200">
                              {app}
                            </span>
                          ))}
                        </div>
                      </div>

                      {pkg.customizable && pkg.customizable.length > 0 && (
                        <div className="pt-3">
                           <p className="text-xs font-bold text-stone-400 uppercase mb-2">إضافات اختيارية:</p>
                           <div className="space-y-2">
                             {pkg.customizable.map(opt => {
                               const isSelected = selectedCustomizations[pkg.id]?.includes(opt.id);
                               return (
                                 <button 
                                   key={opt.id}
                                   onClick={() => toggleCustomization(pkg.id, opt.id)}
                                   className={cn(
                                     "w-full text-right text-xs px-3 py-2 rounded-lg border transition-all flex justify-between items-center",
                                     isSelected ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-white border-stone-100 text-stone-600 hover:border-stone-300"
                                   )}
                                 >
                                   <div className="flex gap-2 items-center">
                                     {isSelected ? <Minus size={14} /> : <Plus size={14} />}
                                     <span>{opt.name}</span>
                                   </div>
                                   <span className="font-bold">+{opt.price}$</span>
                                 </button>
                               )
                             })}
                           </div>
                        </div>
                      )}
                    </div>

                    <button className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold text-sm transition-all hover:bg-amber-500 hover:text-stone-900 shadow-md mt-auto relative z-10 active:scale-95">
                      الإجمالي: <span className="font-black text-lg mx-1">{calculateTotalPrice(pkg)}$</span> | اطلب الأن
                    </button>
                    
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-stone-50 rounded-full opacity-50 -z-0"></div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && user && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <AnimatePresence mode="wait">
                {profileView === 'main' && (
                  <motion.div 
                    key="view-main"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-6"
                  >
                    <div className="md:col-span-12 lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 h-full flex flex-col justify-center relative overflow-hidden text-center">
                      <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto relative z-10">
                        <User size={40} className="text-amber-500" />
                      </div>
                      <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-stone-800">{user.name}</h2>
                        <p className="text-stone-500 text-sm mt-1">{user.email}</p>
                        <p className="text-stone-500 text-sm font-mono mt-1">{user.phone}</p>
                      </div>
                      <button onClick={() => setProfileView('edit')} className="mx-auto bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex gap-2 items-center relative z-10">
                        تعديل البيانات <Edit3 size={14} />
                      </button>
                      <div className="flex justify-center gap-4 py-4 relative z-10">
                        <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 flex flex-col items-center flex-1">
                          <Sun size={20} className="text-amber-500 mb-2" />
                          <span className="text-[10px] text-stone-500 uppercase">الولاء</span>
                          <span className="font-bold text-sm text-stone-700 mt-1">بلاتيني</span>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 flex flex-col items-center flex-1">
                          <ShieldCheck size={20} className="text-emerald-500 mb-2" />
                          <span className="text-[10px] text-stone-500 uppercase">الضمان</span>
                          <span className="font-bold text-sm text-stone-700 mt-1">نشط</span>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full"></div>
                    </div>

                    <div className="md:col-span-12 lg:col-span-8 flex flex-col gap-4">
                      
                      {/* System Details Widget */}
                      <div className="bg-stone-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                         <h3 className="text-stone-400 font-bold mb-4 flex items-center gap-2"><Power size={18} className="text-amber-500"/> تفاصيل النظام: {user.packageName}</h3>
                         <div className="grid grid-cols-2 gap-4 relative z-10">
                           <div>
                             <p className="text-[10px] text-stone-500 uppercase mb-1">الألواح</p>
                             <p className="font-mono text-sm">{user.systemDetails.panels}</p>
                           </div>
                           <div>
                             <p className="text-[10px] text-stone-500 uppercase mb-1">البطارية</p>
                             <p className="font-mono text-sm">{user.systemDetails.battery}</p>
                           </div>
                           <div>
                             <p className="text-[10px] text-stone-500 uppercase mb-1">المحول</p>
                             <p className="font-mono text-sm">{user.systemDetails.inverter}</p>
                           </div>
                           <div>
                             <p className="text-[10px] text-stone-500 uppercase mb-1">تاريخ التركيب</p>
                             <p className="font-mono text-sm">{user.systemDetails.installedDate}</p>
                           </div>
                         </div>
                         <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-stone-800 rounded-full blur-2xl"></div>
                      </div>

                      {/* Menu List */}
                      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex-grow flex flex-col">
                        <ProfileItem onClick={() => setProfileView('history')} icon={<History size={20} className="text-blue-500" />} label="سجل المدفوعات" value={`${user.paidInstallments} أقساط`} />
                        <ProfileItem onClick={() => setProfileView('maintenance')} icon={<Wrench size={20} className="text-emerald-500" />} label="سجل الصيانة" value={`${user.maintenanceLogs.length} عمليات`} />
                        <ProfileItem onClick={() => setProfileView('referral')} icon={<Share2 size={20} className="text-amber-500" />} label="برنامج الإحالة والمكافآت" value={`${user.creditBalance} ر.ي رصيد`} />
                        <ProfileItem icon={<AlertCircle size={20} className="text-stone-400" />} label="مركز المساعدة" className="text-stone-600" />
                      </div>
                      <button className="text-red-400 text-sm font-medium hover:text-red-600 transition-colors py-2 text-center w-full">تسجيل الخروج</button>
                    </div>
                  </motion.div>
                )}

                {profileView === 'edit' && (
                  <motion.div 
                    key="view-edit"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 max-w-md mx-auto"
                  >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
                      <button onClick={() => setProfileView('main')} className="p-2 bg-stone-50 hover:bg-stone-100 rounded-full text-stone-500 transition-colors"><ArrowLeft size={20} /></button>
                      <h3 className="font-bold text-lg text-stone-800">تعديل البيانات</h3>
                    </div>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">الاسم الكامل</label>
                        <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">رقم الهاتف</label>
                        <input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono text-left focus:outline-none focus:ring-2 focus:ring-amber-500/50" dir="ltr" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">البريد الإلكتروني</label>
                        <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono text-left focus:outline-none focus:ring-2 focus:ring-amber-500/50" dir="ltr" />
                      </div>
                      <button type="submit" className="w-full bg-stone-900 text-white rounded-xl py-3 font-bold flex justify-center items-center gap-2 hover:bg-amber-500 hover:text-stone-900 transition-colors mt-4">
                        <Save size={18} /> حفظ التغييرات
                      </button>
                    </form>
                  </motion.div>
                )}

                {profileView === 'history' && (
                  <motion.div 
                    key="view-history"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6"
                  >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
                      <button onClick={() => setProfileView('main')} className="p-2 bg-stone-50 hover:bg-stone-100 rounded-full text-stone-500 transition-colors"><ArrowLeft size={20} /></button>
                      <h3 className="font-bold text-lg text-stone-800">سجل المدفوعات</h3>
                    </div>
                    <div className="space-y-4">
                      {user.paymentHistory.map(payment => (
                        <div key={payment.id} className="flex justify-between items-center p-4 border border-stone-100 rounded-2xl hover:border-stone-200 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
                              <CheckCircle2 size={24} />
                            </div>
                            <div>
                              <p className="font-bold text-stone-800 text-sm">تم السداد: {payment.method}</p>
                              <p className="text-xs text-stone-500 font-mono mt-1">{payment.date}</p>
                            </div>
                          </div>
                          <div className="text-left font-bold text-stone-900">
                            {payment.amount} <span className="text-[10px] text-stone-500 font-normal">ر.ي</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {profileView === 'maintenance' && (
                  <motion.div 
                    key="view-maintenance"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6"
                  >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
                      <button onClick={() => setProfileView('main')} className="p-2 bg-stone-50 hover:bg-stone-100 rounded-full text-stone-500 transition-colors"><ArrowLeft size={20} /></button>
                      <h3 className="font-bold text-lg text-stone-800">سجل الصيانة</h3>
                    </div>
                    <div className="space-y-4">
                      {user.maintenanceLogs.map(log => (
                        <div key={log.id} className="p-4 border border-stone-100 rounded-2xl hover:border-stone-200 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-stone-800 text-sm">{log.type}</h4>
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-bold">{log.status}</span>
                          </div>
                          <div className="flex justify-between items-center mt-3 text-xs text-stone-500">
                            <span>الفني: {log.technician}</span>
                            <span className="font-mono">{log.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {profileView === 'referral' && (
                  <motion.div 
                    key="view-referral"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6"
                  >
                     <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
                      <button onClick={() => setProfileView('main')} className="p-2 bg-stone-50 hover:bg-stone-100 rounded-full text-stone-500 transition-colors"><ArrowLeft size={20} /></button>
                      <h3 className="font-bold text-lg text-stone-800">برنامج المكافآت والإحالة</h3>
                    </div>
                    
                    {/* Visual Credit Graphic */}
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20 mb-6 relative overflow-hidden flex justify-between items-center">
                       <div className="relative z-10">
                         <p className="text-emerald-100 text-sm mb-1 font-bold">رصيد المكافآت الحالي</p>
                         <div className="flex items-baseline gap-2">
                           <span className="font-black text-4xl">{user.creditBalance}</span>
                           <span className="text-emerald-200 font-bold">ر.ي</span>
                         </div>
                         <p className="text-[10px] bg-emerald-800/40 inline-block px-3 py-1 rounded-full mt-3 font-semibold uppercase">يستخدم تلقائياً عند الدفع القادم</p>
                       </div>
                       <div className="bg-white/20 p-4 rounded-full relative z-10 backdrop-blur-sm">
                         <Gift size={48} className="text-white" />
                       </div>
                       <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center mb-6">
                      <h4 className="text-amber-800 font-bold mb-2">شارك كود الإحالة الخاص بك</h4>
                      <p className="text-sm text-amber-700/80 mb-4 leading-relaxed">أرسل الكود لأصدقائك، وسيحصل كل منكم على رصيد <strong>1500 ر.ي</strong> في المحفظة عند شرائهم أي باقة!</p>
                      <div className="bg-white rounded-xl py-3 px-6 inline-flex items-center gap-4 border border-amber-200 font-mono text-2xl font-black text-stone-800 tracking-widest shadow-sm mx-auto">
                        {user.referralCode}
                      </div>
                    </div>

                     <div className="space-y-3">
                       <p className="text-sm font-bold text-stone-800">لديك كود إحالة من صديق؟ أدخله هنا:</p>
                       <div className="flex gap-2">
                         <input 
                           type="text" 
                           placeholder="أدخل كود الصديق هنا" 
                           value={referralCodeInput}
                           onChange={e => setReferralCodeInput(e.target.value)}
                           className="flex-1 border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono text-left focus:outline-none focus:ring-2 focus:ring-amber-500/50 uppercase" dir="ltr"
                         />
                         <button 
                           onClick={handleApplyReferral}
                           className="bg-stone-900 text-white px-8 rounded-xl font-bold hover:bg-amber-500 hover:text-stone-900 transition-colors shadow-md"
                         >
                           تطبيق
                         </button>
                       </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotificationsList && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex justify-end"
          >
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="bg-stone-50 w-full max-w-sm h-full shadow-2xl flex flex-col"
            >
              <div className="bg-white p-6 border-b border-stone-200 flex justify-between items-center">
                <h3 className="font-bold text-lg text-stone-900 flex items-center gap-2">
                  <Bell size={20} className="text-amber-500" /> الإشعارات
                </h3>
                <button onClick={() => setShowNotificationsList(false)} className="p-2 bg-stone-50 hover:bg-stone-100 rounded-full text-stone-500">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.map(note => (
                  <div key={note.id} className={cn("bg-white p-4 rounded-2xl border shadow-sm flex gap-4", note.type === 'alert' ? "border-red-200" : "border-stone-100")}>
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      note.type === 'alert' ? "bg-red-50 text-red-500" : (note.type === 'success' ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500")
                    )}>
                      {note.type === 'alert' ? <AlertCircle size={20} /> : (note.type === 'success' ? <CheckCircle2 size={20} /> : <ThumbsUp size={20} />)}
                    </div>
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-stone-900 text-sm">{note.title}</h4>
                        <span className="text-[10px] text-stone-400">{note.date}</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">{note.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-stone-900">سداد القسط</h3>
                <button onClick={() => setShowPaymentModal(false)} className="p-2 bg-stone-50 hover:bg-stone-100 rounded-full text-stone-500">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
                  <p className="text-sm text-stone-500 mb-1">المبلغ المطلوب</p>
                  <p className="text-3xl font-black text-amber-500">4,500 <span className="text-sm font-normal text-stone-400">ر.ي</span></p>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <Share2 size={20} className="text-emerald-500" />
                     <div>
                       <p className="font-bold text-sm text-emerald-900">استخدام رصيد الإحالة</p>
                       <p className="text-xs text-emerald-700">الرصيد المتاح: {user?.creditBalance} ر.ي</p>
                     </div>
                   </div>
                   <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">طريقة الدفع المختارة</label>
                  <div className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm flex justify-between items-center bg-stone-50">
                    <span className="font-bold">{selectedPaymentMethod}</span>
                    <Smartphone size={18} className="text-stone-400" />
                  </div>
                </div>

                {selectedPaymentMethod === 'كارت شحن' && (
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">رقم الكارت المكون من 14 رقم</label>
                    <input type="text" placeholder="XXXX-XXXX-XXXX-XXXX" className="w-full border border-stone-200 rounded-xl px-4 py-3 text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50" dir="ltr" />
                  </div>
                )}
                {selectedPaymentMethod === 'محفظة حوِّل' && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                    <p className="text-xs text-blue-800 font-bold mb-2">يرجى تحويل المبلغ إلى الرقم:</p>
                    <p className="font-mono text-lg font-black text-blue-900 tracking-widest">770000000</p>
                    <p className="text-[10px] text-blue-600 mt-2">سيتم تفعيل الدفعة تلقائياً عند وصول التحويل</p>
                  </div>
                )}

                <button onClick={handlePayment} className="w-full bg-stone-900 text-white rounded-xl py-4 font-bold hover:bg-amber-500 hover:text-stone-900 transition-colors mt-4">
                  تأكيد الدفع
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

const ProfileItem = ({ icon, label, className, onClick, value }: { icon: React.ReactNode, label: string, className?: string, onClick?: () => void, value?: string }) => (
  <button onClick={onClick} className={cn(
    "w-full flex items-center justify-between p-5 border-b border-stone-100 last:border-none hover:bg-stone-50 active:bg-stone-100 transition-colors text-stone-700",
    className
  )}>
    <div className="flex items-center gap-3">
      <span className="text-stone-400">{icon}</span>
      <span className="font-bold text-sm tracking-wide">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {value && <span className="text-xs font-bold text-stone-400">{value}</span>}
      <ChevronRight size={18} className="text-stone-300" />
    </div>
  </button>
);
