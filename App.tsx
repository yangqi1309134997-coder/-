import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, 
  Video, 
  Calendar, 
  BookOpen, 
  Brain, 
  Menu, 
  X, 
  LogOut, 
  Send,
  Search,
  MessageSquare,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { MOCK_COUNSELORS, MOCK_APPOINTMENTS, MOCK_JOURNAL } from './constants';
import { Counselor, Appointment, JournalEntry, User, UserRole } from './types';
import { matchCounselorsWithAI, analyzeMoodWithAI } from './services/geminiService';

// --- Components ---

const Header = ({ 
  user, 
  onNavigate, 
  currentView,
  onLogout 
}: { 
  user: User | null; 
  onNavigate: (view: string) => void; 
  currentView: string;
  onLogout: () => void;
}) => (
  <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div 
        className="flex items-center space-x-2 cursor-pointer" 
        onClick={() => onNavigate('home')}
      >
        <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
          M
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">
          MindfulHaven
        </span>
      </div>

      <nav className="hidden md:flex items-center space-x-8">
        <button onClick={() => onNavigate('home')} className={`text-sm font-medium hover:text-teal-600 ${currentView === 'home' ? 'text-teal-600' : 'text-slate-600'}`}>首页</button>
        <button onClick={() => onNavigate('counselors')} className={`text-sm font-medium hover:text-teal-600 ${currentView === 'counselors' ? 'text-teal-600' : 'text-slate-600'}`}>找专家</button>
        <button onClick={() => onNavigate('resources')} className={`text-sm font-medium hover:text-teal-600 ${currentView === 'resources' ? 'text-teal-600' : 'text-slate-600'}`}>心理百科</button>
      </nav>

      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-medium transition-colors"
            >
              工作台
            </button>
            <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-200" />
            <button onClick={onLogout} className="text-slate-400 hover:text-slate-600">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => onNavigate('login')}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-sm font-medium transition-colors shadow-lg shadow-teal-600/20"
          >
            登录 / 注册
          </button>
        )}
      </div>
    </div>
  </header>
);

const Hero = ({ onCta }: { onCta: () => void }) => (
  <section className="relative pt-20 pb-32 overflow-hidden">
    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
          在这里，找回内心的<span className="text-teal-600">平静</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
          MindfulHaven 连接您与专业的心理咨询师。通过 AI 智能匹配，
          为您找到最适合的倾听者，开启您的疗愈之旅。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button 
            onClick={onCta}
            className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-lg font-bold transition-all transform hover:scale-105 shadow-xl shadow-teal-600/30"
          >
            开始智能匹配
          </button>
          <button className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full text-lg font-bold transition-colors">
            了解更多
          </button>
        </div>
      </div>
    </div>
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-teal-50 to-white -z-10"></div>
    {/* Decorative circles */}
    <div className="absolute top-20 left-10 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl"></div>
    <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
  </section>
);

const CounselorList = ({ 
  counselors, 
  loading 
}: { 
  counselors: Counselor[]; 
  loading: boolean 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading ? (
        <div className="col-span-full py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-500">AI 正在为您分析匹配...</p>
        </div>
      ) : (
        counselors.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <img src={c.avatar} alt={c.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{c.name}</h3>
                  <p className="text-sm text-teal-600 font-medium">{c.title}</p>
                </div>
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full flex items-center">
                ★ {c.rating}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {c.specialties.map((s, i) => (
                <span key={i} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-md">
                  {s}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-500 mb-6 line-clamp-2">{c.bio}</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">¥{c.price}<span className="text-xs font-normal text-slate-500">/小时</span></span>
              <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm rounded-lg transition-colors">
                预约
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const VideoRoom = ({ onEndCall }: { onEndCall: () => void }) => {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col">
      <div className="flex-1 relative">
        {/* Remote Video (Simulated) */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <img 
            src="https://picsum.photos/1200/800?grayscale" 
            className="w-full h-full object-cover opacity-80"
            alt="Remote"
          />
          <div className="absolute bottom-8 left-8 text-white">
            <h3 className="text-2xl font-bold shadow-black drop-shadow-md">Dr. Sarah Lin</h3>
            <p className="text-teal-400 drop-shadow-md">咨询中 • 00:14:23</p>
          </div>
        </div>

        {/* Local Video (Simulated) */}
        <div className="absolute top-8 right-8 w-48 h-36 bg-black rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl">
          {camOn ? (
            <img src="https://picsum.photos/400/300" className="w-full h-full object-cover transform scale-x-[-1]" alt="Self" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-900">
              <VideoOff size={24} />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="h-24 bg-slate-950 flex items-center justify-center space-x-6">
        <button 
          onClick={() => setMicOn(!micOn)}
          className={`p-4 rounded-full ${micOn ? 'bg-slate-800 text-white' : 'bg-red-500 text-white'} hover:opacity-90 transition-all`}
        >
          {micOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        <button 
          onClick={() => setCamOn(!camOn)}
          className={`p-4 rounded-full ${camOn ? 'bg-slate-800 text-white' : 'bg-red-500 text-white'} hover:opacity-90 transition-all`}
        >
          {camOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
        <button 
          onClick={onEndCall}
          className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all px-8 flex items-center space-x-2"
        >
          <PhoneOff size={24} />
          <span className="font-bold">结束</span>
        </button>
      </div>
    </div>
  );
};

// --- Main Views ---

const CounselorsView = ({ 
  onMatch,
  counselors,
  loading
}: { 
  onMatch: (input: string) => void;
  counselors: Counselor[];
  loading: boolean;
}) => {
  const [input, setInput] = useState('');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl p-8 mb-12 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-4">AI 智能匹配助手</h2>
        <p className="mb-6 opacity-90 max-w-2xl">
          请描述您目前的困扰（如：最近工作压力很大，总是失眠，感觉很焦虑），
          我们的 AI 将为您分析并推荐最合适的咨询专家。
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请在此输入您的问题..."
            className="flex-1 px-6 py-4 rounded-xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-300/50"
            onKeyDown={(e) => e.key === 'Enter' && onMatch(input)}
          />
          <button 
            onClick={() => onMatch(input)}
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors flex items-center justify-center space-x-2"
          >
            <Brain size={20} />
            <span>智能匹配</span>
          </button>
        </div>
      </div>
      
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">推荐专家</h2>
        <button className="text-teal-600 font-medium hover:underline">查看全部</button>
      </div>
      
      <CounselorList counselors={counselors} loading={loading} />
    </div>
  );
};

const DashboardView = ({ 
  user,
  appointments,
  journalEntries,
  onAddJournal,
  onJoinCall
}: { 
  user: User;
  appointments: Appointment[];
  journalEntries: JournalEntry[];
  onAddJournal: (content: string) => void;
  onJoinCall: (id: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'journal'>('overview');
  const [newJournal, setNewJournal] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleJournalSubmit = async () => {
    if (!newJournal.trim()) return;
    setAnalyzing(true);
    await onAddJournal(newJournal);
    setNewJournal('');
    setAnalyzing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-2">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center mb-6">
            <img src={user.avatar} className="w-24 h-24 rounded-full mx-auto mb-4" alt="Profile" />
            <h2 className="font-bold text-xl">{user.name}</h2>
            <p className="text-slate-500 text-sm">普通会员</p>
          </div>
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-6 py-4 rounded-xl font-medium transition-colors ${activeTab === 'overview' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <Calendar size={20} />
            <span>我的日程</span>
          </button>
          <button 
            onClick={() => setActiveTab('journal')}
            className={`w-full flex items-center space-x-3 px-6 py-4 rounded-xl font-medium transition-colors ${activeTab === 'journal' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <BookOpen size={20} />
            <span>情绪日记 (AI)</span>
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Upcoming Appointment */}
              <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold mb-4">即将开始的咨询</h3>
                {appointments.filter(a => a.status === 'upcoming').map(app => (
                  <div key={app.id} className="flex items-center justify-between bg-teal-50 p-4 rounded-xl border border-teal-100">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-teal-100 text-teal-700 rounded-lg">
                        <Video size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{app.counselorName}</h4>
                        <p className="text-sm text-slate-500">{app.date} • {app.time}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onJoinCall(app.id)}
                      className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-md transition-all animate-pulse"
                    >
                      进入诊室
                    </button>
                  </div>
                ))}
              </section>

              {/* Mood Chart */}
              <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6">本周情绪趋势</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={journalEntries}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[0, 10]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="moodScore" 
                        stroke="#0d9488" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'journal' && (
            <div className="space-y-6">
              {/* Input Area */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold mb-4">记录当下的心情</h3>
                <textarea
                  className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-teal-500 mb-4 h-32 resize-none"
                  placeholder="今天发生了什么？你感觉如何？AI 将为您分析情绪..."
                  value={newJournal}
                  onChange={(e) => setNewJournal(e.target.value)}
                />
                <div className="flex justify-end">
                  <button 
                    onClick={handleJournalSubmit}
                    disabled={analyzing || !newJournal.trim()}
                    className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 ${analyzing ? 'bg-slate-300 text-slate-500' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
                  >
                    {analyzing ? (
                      <span>分析中...</span>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>记录并分析</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* History */}
              <div className="space-y-4">
                {journalEntries.slice().reverse().map(entry => (
                  <div key={entry.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-slate-400 font-mono">{entry.date}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${entry.moodScore >= 7 ? 'bg-green-100 text-green-700' : entry.moodScore <= 4 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        情绪指数: {entry.moodScore}/10
                      </span>
                    </div>
                    <p className="text-slate-800 mb-4">{entry.content}</p>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="flex items-start space-x-2 text-sm">
                        <Brain className="text-teal-600 mt-0.5 flex-shrink-0" size={16} />
                        <div>
                          <p className="font-bold text-slate-700 mb-1">AI 洞察:</p>
                          <p className="text-slate-600 mb-2">{entry.sentiment}</p>
                          <p className="text-teal-600 italic">" {entry.suggestion} "</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const LoginView = ({ onLogin }: { onLogin: () => void }) => (
  <div className="min-h-[80vh] flex items-center justify-center">
    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">
      <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Users size={32} />
      </div>
      <h2 className="text-2xl font-bold mb-2">欢迎回到心宁港湾</h2>
      <p className="text-slate-500 mb-8">请选择登录身份</p>
      
      <div className="space-y-4">
        <button 
          onClick={onLogin}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all"
        >
          来访者登录
        </button>
        <button className="w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all">
          咨询师登录
        </button>
      </div>
      
      <p className="mt-8 text-xs text-slate-400">
        登录即代表您同意我们的 <a href="#" className="underline">隐私政策</a> 和 <a href="#" className="underline">服务条款</a>。
      </p>
    </div>
  </div>
);

// --- App Root ---

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [counselors, setCounselors] = useState<Counselor[]>(MOCK_COUNSELORS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(MOCK_JOURNAL);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [inCall, setInCall] = useState(false);

  // Simulate scrolling to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const handleLogin = () => {
    setUser({
      id: 'u1',
      name: '张小明',
      role: UserRole.CLIENT,
      email: 'xiaoming@example.com',
      avatar: 'https://picsum.photos/100/100?random=user'
    });
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('home');
  };

  const handleAiMatch = async (request: string) => {
    if (!request.trim()) return;
    setLoadingMatch(true);
    
    // Simulate slight network delay + AI processing
    const result = await matchCounselorsWithAI(request, MOCK_COUNSELORS);
    
    if (result.matchedCounselorIds.length > 0) {
      const matched = MOCK_COUNSELORS.filter(c => result.matchedCounselorIds.includes(c.id));
      // Put matched ones first
      const others = MOCK_COUNSELORS.filter(c => !result.matchedCounselorIds.includes(c.id));
      setCounselors([...matched, ...others]);
    }
    
    setLoadingMatch(false);
  };

  const handleAddJournal = async (content: string) => {
    const analysis = await analyzeMoodWithAI(content);
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      content,
      moodScore: analysis.moodScore,
      sentiment: analysis.sentiment,
      suggestion: analysis.suggestion
    };
    setJournalEntries([...journalEntries, newEntry]);
  };

  if (inCall) {
    return <VideoRoom onEndCall={() => setInCall(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        user={user} 
        onNavigate={setCurrentView} 
        currentView={currentView}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <Hero onCta={() => setCurrentView('counselors')} />
            <div className="bg-white py-16">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-12">为什么选择我们</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="p-6">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-4">
                      <Brain size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">AI 智能匹配</h3>
                    <p className="text-slate-500">不再盲目寻找。我们的算法通过分析您的具体需求，为您匹配最契合的咨询师。</p>
                  </div>
                  <div className="p-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
                      <Video size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">私密视频咨询</h3>
                    <p className="text-slate-500">端到端加密的高清视频通话，让您在舒适安全的家中享受专业服务。</p>
                  </div>
                  <div className="p-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mx-auto mb-4">
                      <BookOpen size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">成长工具包</h3>
                    <p className="text-slate-500">免费的情绪日记、冥想音频和心理测试，陪伴您日常的自我疗愈。</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {currentView === 'counselors' && (
          <CounselorsView 
            onMatch={handleAiMatch} 
            counselors={counselors} 
            loading={loadingMatch}
          />
        )}

        {currentView === 'dashboard' && user && (
          <DashboardView 
            user={user}
            appointments={MOCK_APPOINTMENTS}
            journalEntries={journalEntries}
            onAddJournal={handleAddJournal}
            onJoinCall={() => setInCall(true)}
          />
        )}

        {currentView === 'login' && (
          <LoginView onLogin={handleLogin} />
        )}

        {/* Placeholder for resources page */}
        {currentView === 'resources' && (
          <div className="container mx-auto px-4 py-20 text-center">
            <h2 className="text-3xl font-bold mb-4">心理百科资源库</h2>
            <p className="text-slate-500">正在建设中，敬请期待...</p>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold text-lg mb-4">MindfulHaven</h4>
              <p className="text-sm">致力于为您提供最专业、最便捷的心理健康服务。</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">平台服务</h4>
              <ul className="space-y-2 text-sm">
                <li>找咨询师</li>
                <li>心理测评</li>
                <li>企业EAP</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">支持</h4>
              <ul className="space-y-2 text-sm">
                <li>帮助中心</li>
                <li>隐私政策</li>
                <li>联系我们</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">紧急求助</h4>
              <p className="text-sm text-red-400 mb-2">如果您处于危机中，请立即拨打：</p>
              <p className="text-2xl font-bold text-white">400-888-1234</p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-xs">
            © 2023 MindfulHaven. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
