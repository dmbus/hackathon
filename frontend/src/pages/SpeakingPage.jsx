import {
    AlertCircle,
    Award,
    BarChart3,
    BookOpen,
    CheckCircle2,
    ChevronRight,
    Mic,
    RefreshCw,
    Square,
    Volume2,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Mock Data for the simulation ---
const QUESTION_DATA = {
    category: "Travel & Lifestyle",
    level: "Intermediate B1",
    question: "Describe a memorable trip you took recently. Why was it special?",
    tips: ["Use past tense verbs", "Include sensory details", "Mention who you were with"]
};

const FEEDBACK_DATA = {
    overallScore: 82,
    audioDuration: "00:45",
    metrics: {
        fluency: 85,
        grammar: 78,
        vocabulary: 88,
        pronunciation: 80
    },
    transcript: "Last summer I go to Paris with my family. It was very beautiful city. We eated a lot of croissants and visit the Eiffel Tower at night.",
    corrections: [
        {
            original: "Last summer I go to Paris",
            correction: "Last summer I went to Paris",
            type: "Grammar",
            explanation: "Use past simple for completed actions in the past."
        },
        {
            original: "We eated a lot",
            correction: "We ate a lot",
            type: "Grammar",
            explanation: "'Eat' is an irregular verb."
        },
        {
            original: "It was very beautiful city",
            correction: "It was a very beautiful city",
            type: "Grammar",
            explanation: "Don't forget the article 'a' before singular noun phrases."
        }
    ],
    vocabulary_suggestions: [
        { word: "Beautiful", alternative: "Breathtaking / Picturesque" },
        { word: "Big", alternative: "Massive / Colossal" }
    ]
};

// --- Helper Components ---

const Button = ({ children, onClick, variant = 'primary', icon: Icon, className = '' }) => {
    const baseStyles = "flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-95";

    // Design System: Action Buttons vs Icon Buttons
    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 py-4 shadow-lg shadow-indigo-200",
        secondary: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-full px-6 py-3 shadow-sm hover:shadow-md",
        icon: "p-4 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm hover:scale-110 hover:text-indigo-600 hover:shadow-md",
        danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 rounded-full px-6 py-3"
    };

    return (
        <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
            {Icon && <Icon size={20} />}
            {children}
        </button>
    );
};

const ProgressBar = ({ label, value, colorClass = "bg-indigo-500" }) => (
    <div className="mb-4">
        <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
            <span className="font-mono text-sm font-bold text-slate-700">{value}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
                style={{ width: `${value}%` }}
            />
        </div>
    </div>
);

const Badge = ({ children, type = 'neutral' }) => {
    const colors = {
        neutral: "bg-slate-100 text-slate-600",
        indigo: "bg-indigo-50 text-indigo-600",
        rose: "bg-rose-50 text-rose-600"
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colors[type]}`}>
            {children}
        </span>
    );
};

// --- Main Component ---

export default function SpeakingPage() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('idle'); // idle, recording, processing, feedback
    const [timeLeft, setTimeLeft] = useState(60);
    const [bars, setBars] = useState(Array(12).fill(10));

    // Timer Logic
    useEffect(() => {
        let interval;
        if (status === 'recording' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
                // Animate audio bars randomly
                setBars(bars.map(() => Math.floor(Math.random() * 40) + 10));
            }, 1000);
        } else if (timeLeft === 0) {
            finishRecording();
        }
        return () => clearInterval(interval);
    }, [status, timeLeft]);

    // Simulated Audio Visualizer (Faster update for smooth visuals)
    useEffect(() => {
        let animationFrame;
        if (status === 'recording') {
            const animate = () => {
                setBars(prev => prev.map(() => Math.max(10, Math.min(60, Math.random() * 60))));
                animationFrame = requestAnimationFrame(animate);
            };
            // Slow down the animation slightly for visual comfort
            const interval = setInterval(() => {
                requestAnimationFrame(animate);
            }, 100);
            return () => {
                cancelAnimationFrame(animationFrame);
                clearInterval(interval);
            };
        }
    }, [status]);

    const startRecording = () => {
        setStatus('recording');
        setTimeLeft(60);
    };

    const finishRecording = () => {
        setStatus('processing');
        setTimeout(() => {
            setStatus('feedback');
        }, 2500); // Simulate API delay
    };

    const reset = () => {
        setStatus('idle');
        setTimeLeft(60);
    };

    // --- Render Stages ---

    const renderHeader = () => (
        <div className="flex justify-between items-start mb-8">
            <div>
                <button onClick={() => navigate('/learning/speaking')} className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 mb-2 transition-colors text-sm font-semibold">
                    <ChevronRight size={16} className="rotate-180" /> Back to History
                </button>
                <div className="flex items-center gap-3 mb-2">
                    <Badge type="indigo">{QUESTION_DATA.category}</Badge>
                    <span className="text-slate-400 text-sm font-semibold">•</span>
                    <span className="text-slate-400 text-sm font-medium">{QUESTION_DATA.level}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
                    Speaking Practice
                </h1>
            </div>
            <div className="hidden md:block">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Volume2 size={20} />
                </div>
            </div>
        </div>
    );

    const renderIdle = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-50 rounded-xl p-8 mb-8 border border-slate-100">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                    Today's Question
                </h2>
                <p className="text-2xl md:text-3xl font-medium text-slate-700 leading-relaxed">
                    "{QUESTION_DATA.question}"
                </p>
            </div>

            <div className="space-y-4 mb-10">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Zap size={16} className="text-indigo-500" />
                    Quick Tips
                </h3>
                <ul className="grid md:grid-cols-3 gap-4">
                    {QUESTION_DATA.tips.map((tip, idx) => (
                        <li key={idx} className="bg-white border border-slate-100 rounded-lg p-3 text-sm text-slate-600 shadow-sm flex items-start gap-2">
                            <span className="bg-indigo-100 text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                {idx + 1}
                            </span>
                            {tip}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex justify-center">
                <Button onClick={startRecording} icon={Mic} className="w-full md:w-auto min-w-[200px]">
                    Start Answer
                </Button>
            </div>
        </div>
    );

    const renderRecording = () => (
        <div className="text-center py-8 animate-in zoom-in-95 duration-300">
            <div className="mb-8 relative inline-block">
                {/* Pulsing rings */}
                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-white p-6 rounded-full shadow-xl border border-indigo-50">
                    <Mic size={48} className="text-indigo-600" />
                </div>
            </div>

            <h2 className="text-slate-400 font-semibold uppercase tracking-wider text-sm mb-2">Recording</h2>
            <div className="text-5xl font-mono font-bold text-slate-800 mb-8 tabular-nums">
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </div>

            {/* Audio Visualizer */}
            <div className="h-16 flex items-center justify-center gap-1 mb-10">
                {bars.map((height, i) => (
                    <div
                        key={i}
                        className="w-2 bg-indigo-400 rounded-full transition-all duration-100"
                        style={{ height: `${height}px`, opacity: 0.5 + (height / 120) }}
                    ></div>
                ))}
            </div>

            <div className="flex justify-center gap-4">
                <Button variant="danger" onClick={reset}>Cancel</Button>
                <Button variant="primary" onClick={finishRecording} icon={Square}>Stop & Submit</Button>
            </div>
        </div>
    );

    const renderProcessing = () => (
        <div className="py-20 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing Speech</h3>
            <p className="text-slate-500">Checking grammar, pronunciation, and flow...</p>
        </div>
    );

    const renderFeedback = () => (
        <div className="animate-in slide-in-from-bottom-8 duration-700">
            {/* Score Header */}
            <div className="bg-indigo-600 rounded-2xl p-6 text-white mb-8 shadow-lg shadow-indigo-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative w-20 h-20 flex items-center justify-center bg-indigo-500 rounded-full ring-4 ring-indigo-400/30">
                            <span className="text-3xl font-extrabold tracking-tight">{FEEDBACK_DATA.overallScore}</span>
                        </div>
                        <div>
                            <h2 className="text-indigo-100 text-sm font-semibold uppercase tracking-wider mb-1">Overall Score</h2>
                            <p className="text-2xl font-bold">Great Job!</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="p-3 bg-indigo-500/50 hover:bg-indigo-500 rounded-xl transition-colors backdrop-blur-sm">
                            <Volume2 size={20} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Metrics Column */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                        <BarChart3 size={16} /> Performance Metrics
                    </h3>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <ProgressBar label="Fluency & Coherence" value={FEEDBACK_DATA.metrics.fluency} colorClass="bg-emerald-500" />
                        <ProgressBar label="Grammar Accuracy" value={FEEDBACK_DATA.metrics.grammar} colorClass="bg-blue-500" />
                        <ProgressBar label="Vocabulary Range" value={FEEDBACK_DATA.metrics.vocabulary} colorClass="bg-violet-500" />
                        <ProgressBar label="Pronunciation" value={FEEDBACK_DATA.metrics.pronunciation} colorClass="bg-amber-500" />
                    </div>
                </div>

                {/* Vocabulary Suggestions */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                        <BookOpen size={16} /> Vocabulary Boost
                    </h3>
                    <div className="space-y-3">
                        {FEEDBACK_DATA.vocabulary_suggestions.map((item, idx) => (
                            <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-start gap-4">
                                <div className="mt-1">
                                    <Award size={20} className="text-amber-500" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Instead of "{item.word}"</div>
                                    <div className="text-slate-700 font-semibold">{item.alternative}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Corrections Section */}
            <div className="mb-10">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Detailed Corrections
                </h3>
                <div className="space-y-4">
                    {FEEDBACK_DATA.corrections.map((item, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row">
                                {/* Incorrect Side */}
                                <div className="p-4 md:w-1/2 border-b md:border-b-0 md:border-r border-slate-100 bg-rose-50/30">
                                    <div className="flex items-center gap-2 mb-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
                                        <AlertCircle size={14} /> You Said
                                    </div>
                                    <p className="text-slate-600 font-mono text-sm leading-relaxed relative">
                                        {/* Simulating strikethrough effect for visual emphasis */}
                                        <span className="line-through decoration-rose-400 decoration-2 opacity-70">{item.original}</span>
                                    </p>
                                </div>

                                {/* Correct Side */}
                                <div className="p-4 md:w-1/2 bg-indigo-50/30">
                                    <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-xs uppercase tracking-wide">
                                        <CheckCircle2 size={14} /> Better Choice
                                    </div>
                                    <p className="text-slate-800 font-medium text-sm leading-relaxed">
                                        {item.correction}
                                    </p>
                                    <p className="mt-2 text-xs text-slate-500 italic">
                                        Rule: {item.explanation}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-center gap-4 py-4 border-t border-slate-100">
                <Button variant="secondary" onClick={reset} icon={RefreshCw}>Try Another</Button>
                <Button variant="primary" onClick={() => alert("Moving to next lesson...")} icon={ChevronRight}>Next Lesson</Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 font-sans text-slate-600">
            {/* Main Card Container */}
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative transition-all duration-500">

                {/* Progress Bar (Top) - Only shown in recording/idle */}
                {status !== 'feedback' && (
                    <div className="h-1 bg-slate-100 w-full">
                        <div
                            className="h-full bg-indigo-600 transition-all duration-300"
                            style={{
                                width: status === 'idle' ? '25%' : status === 'recording' ? '50%' : '75%'
                            }}
                        />
                    </div>
                )}

                <div className="p-6 md:p-10">
                    {status !== 'feedback' && renderHeader()}

                    <div className="min-h-[400px]">
                        {status === 'idle' && renderIdle()}
                        {status === 'recording' && renderRecording()}
                        {status === 'processing' && renderProcessing()}
                        {status === 'feedback' && renderFeedback()}
                    </div>
                </div>
            </div>
        </div>
    );
}
