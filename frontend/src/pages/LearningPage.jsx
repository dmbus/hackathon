import {
    Bell,
    BookOpen,
    CheckCircle2,
    ChevronRight,
    Flame,
    Headphones,
    LayoutDashboard,
    Mic2,
    MoreHorizontal,
    Play,
    Settings,
    Star,
    Trophy,
    User,
    Volume2
} from 'lucide-react';
import { useState } from 'react';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
    >
        <Icon size={20} className={active ? 'text-white' : 'group-hover:text-indigo-600'} />
        <span className="font-semibold">{label}</span>
    </button>
);

const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden ${className}`}>
        {children}
    </div>
);

const SectionHeader = ({ overline, title }) => (
    <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">{overline}</p>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">{title}</h2>
    </div>
);

const LearningPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [progress, setProgress] = useState(65);

    // Mock data for leaderboard
    const leaderboard = [
        { rank: 1, name: "Elena R.", xp: 12450, avatar: "ER" },
        { rank: 2, name: "Marcus W.", xp: 11200, avatar: "MW" },
        { rank: 3, name: "You", xp: 9840, avatar: "ME", highlighted: true },
        { rank: 4, name: "Sarah J.", xp: 8700, avatar: "SJ" },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Learning Column */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Active Deck / Flashcards */}
                            <section>
                                <SectionHeader overline="Continue Learning" title="Vocabulary Decks" />
                                <Card className="p-6 flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-white to-slate-50">
                                    <div className="w-32 h-32 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <BookOpen size={48} />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md">B2 UPPER INTERMEDIATE</span>
                                            <span className="text-slate-400 text-xs font-medium">BUSINESS FRENCH</span>
                                        </div>
                                        <h3 className="text-xl font-extrabold text-slate-800 mb-2">Corporate Negotiations</h3>
                                        <p className="text-slate-500 text-sm mb-4">42 words left to master in this deck.</p>
                                        <div className="w-full bg-slate-200 h-2 rounded-full mb-4">
                                            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                                        </div>
                                        <button className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95">
                                            Practice Flashcards
                                        </button>
                                    </div>
                                </Card>
                            </section>

                            {/* Practice Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Speaking Practice */}
                                <Card className="p-6 hover:border-indigo-300 transition-colors group cursor-pointer">
                                    <div className="p-3 bg-rose-50 rounded-xl w-fit mb-4 group-hover:bg-rose-100 transition-colors">
                                        <Mic2 className="text-rose-500" size={24} />
                                    </div>
                                    <h3 className="text-lg font-extrabold text-slate-800 mb-1">Speaking Practice</h3>
                                    <p className="text-slate-500 text-sm mb-4">Simulate real-world conversations with AI feedback.</p>
                                    <div className="flex items-center text-indigo-600 font-bold text-sm">
                                        Start Session <ChevronRight size={16} />
                                    </div>
                                </Card>

                                {/* Pronunciation Trainer */}
                                <Card className="p-6 hover:border-indigo-300 transition-colors group cursor-pointer">
                                    <div className="p-3 bg-blue-50 rounded-xl w-fit mb-4 group-hover:bg-blue-100 transition-colors">
                                        <Volume2 className="text-blue-500" size={24} />
                                    </div>
                                    <h3 className="text-lg font-extrabold text-slate-800 mb-1">Pronunciation Trainer</h3>
                                    <p className="text-slate-500 text-sm mb-4">Master difficult phonemes and tonal inflections.</p>
                                    <div className="flex items-center text-indigo-600 font-bold text-sm">
                                        Open Lab <ChevronRight size={16} />
                                    </div>
                                </Card>
                            </div>

                            {/* Audio Lesson Player */}
                            <section>
                                <SectionHeader overline="Listening Skills" title="Daily Audio Digest" />
                                <Card className="p-0">
                                    <div className="p-6 flex items-center gap-4 border-b border-slate-100">
                                        <button
                                            onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                                            className="p-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-md active:scale-90"
                                        >
                                            {isAudioPlaying ? <div className="flex gap-1"><div className="w-1 h-4 bg-white animate-pulse"></div><div className="w-1 h-4 bg-white animate-pulse delay-75"></div></div> : <Play fill="white" size={20} />}
                                        </button>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800">L'économie Circulaire en France</h4>
                                            <p className="text-xs font-mono text-slate-400">03:45 / 12:20 • Intermediate</p>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-2">
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Star size={20} /></button>
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><MoreHorizontal size={20} /></button>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-600 italic">"Comprendre les enjeux du recyclage..."</span>
                                        <button className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline">Take comprehension test</button>
                                    </div>
                                </Card>
                            </section>
                        </div>

                        {/* Sidebar Stats Column */}
                        <div className="space-y-8">
                            {/* Leaderboard Card */}
                            <section>
                                <SectionHeader overline="Ranking" title="Leaderboard" />
                                <Card className="p-4">
                                    <div className="space-y-3">
                                        {leaderboard.map((user) => (
                                            <div
                                                key={user.rank}
                                                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${user.highlighted ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50'}`}
                                            >
                                                <span className={`w-6 text-center font-bold ${user.rank <= 3 ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                    {user.rank}
                                                </span>
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                                                    {user.avatar}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`font-bold text-sm ${user.highlighted ? 'text-indigo-900' : 'text-slate-800'}`}>{user.name}</p>
                                                    <p className="text-xs text-slate-500">{user.xp.toLocaleString()} XP</p>
                                                </div>
                                                {user.rank === 1 && <Trophy size={16} className="text-yellow-500" />}
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                                        View full rankings
                                    </button>
                                </Card>
                            </section>

                            {/* Subscription Status */}
                            <Card className="p-6 bg-slate-900 text-white relative overflow-hidden">
                                <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-600 rounded-full blur-3xl opacity-30"></div>
                                <SectionHeader overline="Membership" title="" />
                                <h3 className="text-xl font-extrabold mb-2">LingoFlash Plus</h3>
                                <p className="text-slate-400 text-sm mb-6 font-medium">Unlimited practice, offline mode, and advanced AI tutor features active.</p>
                                <div className="flex items-center justify-between text-xs font-bold text-indigo-300 mb-2">
                                    <span>Next billing date</span>
                                    <span>Oct 12, 2024</span>
                                </div>
                                <button className="w-full py-3 bg-white text-slate-900 rounded-full font-bold shadow-lg hover:bg-slate-100 active:scale-95 transition-all text-sm">
                                    Manage Subscription
                                </button>
                            </Card>
                        </div>
                    </div>
                );

            case 'settings':
                return (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <SectionHeader overline="Preferences" title="Account Settings" />
                        <Card className="divide-y divide-slate-100">
                            <div className="p-6 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-800">Profile Information</h4>
                                    <p className="text-sm text-slate-500">Update your photo, bio, and public display name.</p>
                                </div>
                                <button className="p-3 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"><User size={20} /></button>
                            </div>
                            <div className="p-6 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-800">Learning Goals</h4>
                                    <p className="text-sm text-slate-500">Currently set to "Intermediate (B2)" — 30 mins/day.</p>
                                </div>
                                <button className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">Change</button>
                            </div>
                            <div className="p-6 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-800">App Notifications</h4>
                                    <p className="text-sm text-slate-500">Daily reminders and leaderboard alerts.</p>
                                </div>
                                <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </Card>

                        <SectionHeader overline="System" title="App Configuration" />
                        <Card className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">App Theme</label>
                                    <select className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option>System Default</option>
                                        <option>Light Mode</option>
                                        <option>Dark Mode</option>
                                        <option>High Contrast</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Audio Quality</label>
                                    <select className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option>Standard (64kbps)</option>
                                        <option>High (128kbps)</option>
                                        <option>Ultra (Hi-Fi)</option>
                                    </select>
                                </div>
                            </div>
                        </Card>
                    </div>
                );

            default:
                return <div className="p-20 text-center text-slate-400">Module under development...</div>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">

            {/* Sidebar Navigation */}
            <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 sticky top-0 h-screen hidden lg:flex">
                <div className="flex items-center gap-2 px-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">L</div>
                    <span className="text-2xl font-extrabold tracking-tight text-slate-900">LingoFlash</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <SidebarItem icon={BookOpen} label="Word Decks" active={activeTab === 'decks'} onClick={() => setActiveTab('decks')} />
                    <SidebarItem icon={Mic2} label="Speaking" active={activeTab === 'speaking'} onClick={() => setActiveTab('speaking')} />
                    <SidebarItem icon={Headphones} label="Listening" active={activeTab === 'listening'} onClick={() => navigate('/learning/listening')} />
                    <SidebarItem icon={Trophy} label="Leaderboard" active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} />
                </nav>

                <div className="pt-6 border-t border-slate-100 space-y-2">
                    <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">JD</div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">John Doe</p>
                                <p className="text-xs text-slate-500">Standard Plan</p>
                            </div>
                        </div>
                        <button className="w-full py-2 text-xs font-bold text-indigo-600 bg-white border border-indigo-50 rounded-lg hover:bg-indigo-50 transition-colors">Upgrade to Plus</button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">

                {/* Top Bar / Mobile Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center justify-between lg:block">
                        <div className="lg:hidden flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">L</div>
                            <span className="text-xl font-extrabold text-slate-900">LingoFlash</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome back, John! 👋</h1>
                            <p className="text-slate-500 font-medium">You've reached <span className="text-indigo-600 font-bold">65%</span> of your weekly goal.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
                        <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 rounded-xl">
                            <Flame size={20} className="text-rose-500 fill-rose-500" />
                            <span className="font-extrabold text-rose-600">12 Days</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-xl">
                            <CheckCircle2 size={20} className="text-indigo-500" />
                            <span className="font-extrabold text-indigo-600">420 XP</span>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
                        <button className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-all">
                            <Bell size={20} />
                        </button>
                    </div>
                </header>

                {/* Dynamic Content */}
                {renderContent()}

            </main>

            {/* Floating Action Button for Mobile */}
            <button className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-2xl lg:hidden active:scale-95 transition-transform z-50">
                <Play fill="white" size={24} />
            </button>
        </div>
    );
};

export default LearningPage;
