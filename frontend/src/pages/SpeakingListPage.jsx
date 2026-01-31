import {
    Award,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Filter,
    Mic,
    Play,
    Search,
    TrendingUp
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Mock Data ---
const MOCK_HISTORY = [
    {
        id: "eval_101",
        topic: "Travel & Lifestyle",
        question: "Describe a memorable trip you took recently.",
        date: "2023-10-24T14:30:00",
        score: 82,
        duration: "45s",
        tags: ["B1", "Intermediate"]
    },
    {
        id: "eval_102",
        topic: "Business & Career",
        question: "How do you handle conflict in the workplace?",
        date: "2023-10-22T09:15:00",
        score: 68,
        duration: "58s",
        tags: ["B2", "Professional"]
    },
    {
        id: "eval_103",
        topic: "Technology",
        question: "What impact does AI have on education?",
        date: "2023-10-20T16:45:00",
        score: 91,
        duration: "62s",
        tags: ["C1", "Advanced"]
    },
    {
        id: "eval_104",
        topic: "Daily Routine",
        question: "Describe your typical morning routine.",
        date: "2023-10-18T08:00:00",
        score: 88,
        duration: "35s",
        tags: ["A2", "Beginner"]
    },
    {
        id: "eval_105",
        topic: "Environment",
        question: "What can individuals do to help climate change?",
        date: "2023-10-15T11:20:00",
        score: 74,
        duration: "50s",
        tags: ["B2", "Intermediate"]
    },
    {
        id: "eval_106",
        topic: "Food & Culture",
        question: "What is a traditional dish from your country?",
        date: "2023-10-10T19:30:00",
        score: 95,
        duration: "42s",
        tags: ["B1", "General"]
    }
];

// --- Helper Components ---

const Badge = ({ children, color = 'slate' }) => {
    const styles = {
        slate: "bg-slate-100 text-slate-600",
        indigo: "bg-indigo-50 text-indigo-700",
        emerald: "bg-emerald-50 text-emerald-700",
        amber: "bg-amber-50 text-amber-700",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[color] || styles.slate}`}>
            {children}
        </span>
    );
};

const ScoreRing = ({ score }) => {
    const getColor = (s) => {
        if (s >= 90) return "text-emerald-500 border-emerald-500 bg-emerald-50";
        if (s >= 75) return "text-indigo-500 border-indigo-500 bg-indigo-50";
        if (s >= 60) return "text-amber-500 border-amber-500 bg-amber-50";
        return "text-rose-500 border-rose-500 bg-rose-50";
    };

    return (
        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm ${getColor(score)}`}>
            {score}
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, trend, trendUp }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            {trend && (
                <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                    <TrendingUp size={12} /> {trend}
                </div>
            )}
        </div>
        <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
            <Icon size={24} />
        </div>
    </div>
);

// --- Main App Component ---

export default function SpeakingListPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('All');

    // Filter Logic
    const filteredData = useMemo(() => {
        return MOCK_HISTORY.filter(item => {
            const matchesSearch = item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.question.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterLevel === 'All' || item.tags.some(t => t.includes(filterLevel));
            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, filterLevel]);

    // Derived Statistics
    const avgScore = Math.round(filteredData.reduce((acc, curr) => acc + curr.score, 0) / (filteredData.length || 1));
    const totalTime = filteredData.length * 45; // Approximated for demo

    return (
        <div className="min-h-screen bg-slate-50 text-slate-600 font-sans p-4 md:p-8">

            {/* Header Section */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Evaluation History</h1>
                        <p className="text-slate-500 font-medium">Track your speaking progress and feedback.</p>
                    </div>
                    <button
                        onClick={() => navigate('/learning/speaking/practice')}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        <Mic size={18} />
                        New Practice
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard
                        icon={TrendingUp}
                        label="Average Score"
                        value={`${avgScore}%`}
                        trend="+2.4% vs last month"
                        trendUp={true}
                    />
                    <StatCard
                        icon={Clock}
                        label="Total Practice Time"
                        value={`${Math.floor(totalTime / 60)}h ${totalTime % 60}m`}
                        trend="Keep it up!"
                        trendUp={true}
                    />
                    <StatCard
                        icon={Award}
                        label="Completed Sessions"
                        value={filteredData.length}
                        trend="Top 10% of students"
                        trendUp={true}
                    />
                </div>

                {/* Filters & Actions Bar */}
                <div className="bg-white p-4 rounded-t-2xl border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search topics or questions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div className="hidden md:block h-8 w-px bg-slate-200 mx-2"></div>
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-400" />
                            <select
                                className="bg-transparent text-sm font-semibold text-slate-600 focus:outline-none cursor-pointer"
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                            >
                                <option value="All">All Levels</option>
                                <option value="B1">B1 Intermediate</option>
                                <option value="B2">B2 Upper Int.</option>
                                <option value="C1">C1 Advanced</option>
                            </select>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-b-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Topic & Question</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Results</th>
                                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Start</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">

                                            {/* Topic Column */}
                                            <td className="py-4 px-6 align-top">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800 text-sm mb-1">{item.topic}</span>
                                                    <span className="text-slate-500 text-xs line-clamp-1 mb-2">"{item.question}"</span>
                                                    <div className="flex gap-2">
                                                        {item.tags.map(tag => (
                                                            <Badge key={tag} color={tag.includes('Advanced') || tag.includes('C1') ? 'indigo' : 'slate'}>
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Date Column */}
                                            <td className="py-4 px-6 align-top">
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1 pl-6">
                                                    {new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>

                                            {/* Score Column */}
                                            <td className="py-4 px-6 align-middle">
                                                <div className="flex justify-center">
                                                    <ScoreRing score={item.score} />
                                                </div>
                                            </td>

                                            {/* Action Column */}
                                            <td className="py-4 px-6 align-middle text-right">
                                                <div className="flex items-center justify-end">
                                                    <button
                                                        onClick={() => navigate('/learning/speaking/practice')}
                                                        className="h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95"
                                                    >
                                                        <Play size={16} className="ml-0.5" fill="currentColor" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-12 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <Search size={32} className="opacity-20" />
                                                <p>No evaluations found matching your filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <span className="text-xs font-semibold text-slate-500">
                            Showing <span className="text-slate-800">1-{filteredData.length}</span> of <span className="text-slate-800">{filteredData.length}</span> results
                        </span>
                        <div className="flex gap-2">
                            <button disabled className="p-2 rounded-lg border border-slate-200 text-slate-300 cursor-not-allowed">
                                <ChevronLeft size={16} />
                            </button>
                            <button className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:shadow-sm hover:text-indigo-600 transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
