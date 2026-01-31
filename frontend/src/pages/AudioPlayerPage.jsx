import {
    AlertCircle,
    BookOpen,
    ChevronLeft,
    Clock,
    Download,
    GraduationCap,
    Pause,
    Play,
    RotateCcw,
    Settings2,
    Volume2,
    VolumeX
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Mock Data: Lesson Content ---
const lessonData = {
    title: "Chapter 3: At the Café",
    description: "Ordering coffee and pastries in Paris.",
    duration: 65, // seconds (approx)
    // Switched to a standard MP3 for better browser compatibility
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    transcript: [
        { id: 1, start: 0, end: 4, speaker: "Narrator", text: "Listen closely to the dialogue between the customer and the barista." },
        { id: 2, start: 4, end: 7, speaker: "Pierre", text: "Bonjour, madame. Je voudrais un café, s'il vous plaît." },
        { id: 3, start: 7, end: 11, speaker: "Barista", text: "Bonjour, monsieur. Un café noir ou un café au lait ?" },
        { id: 4, start: 11, end: 15, speaker: "Pierre", text: "Un grand café au lait, et aussi un croissant." },
        { id: 5, start: 15, end: 19, speaker: "Barista", text: "Très bien. Ça fera quatre euros cinquante." },
        { id: 6, start: 19, end: 23, speaker: "Pierre", text: "Voilà. Merci beaucoup, madame. Bonne journée." },
        { id: 7, start: 23, end: 27, speaker: "Barista", text: "Merci à vous. Au revoir !" },
        { id: 8, start: 27, end: 35, speaker: "Narrator", text: "Now, repeat after the speakers. Pay attention to the intonation." }
    ],
    vocabulary: [
        { id: 1, word: "Je voudrais", translation: "I would like", phonetic: "/ʒə vu.dʁɛ/", type: "phrase" },
        { id: 2, word: "Café au lait", translation: "Coffee with milk", phonetic: "/ka.fe o lɛ/", type: "noun" },
        { id: 3, word: "S'il vous plaît", translation: "Please", phonetic: "/sil vu plɛ/", type: "phrase" },
        { id: 4, word: "Croissant", translation: "Crescent roll", phonetic: "/kʁwa.sɑ̃/", type: "noun" },
        { id: 5, word: "Cinquante", translation: "Fifty", phonetic: "/sɛ̃.kɑ̃t/", type: "number" },
        { id: 6, word: "Bonne journée", translation: "Have a nice day", phonetic: "/bɔn ʒuʁ.ne/", type: "phrase" },
    ]
};

// --- Helper: Format seconds to MM:SS ---
const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// --- Sub-Component: Transcript Item ---
const TranscriptSegment = ({ segment, isActive, onClick }) => {
    const activeRef = useRef(null);

    useEffect(() => {
        if (isActive && activeRef.current) {
            activeRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [isActive]);

    return (
        <div
            ref={activeRef}
            onClick={() => onClick(segment.start)}
            className={`
        p-4 rounded-xl cursor-pointer transition-all duration-300 border mb-3
        ${isActive
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm scale-[1.02]'
                    : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50'
                }
      `}
        >
            <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {segment.speaker}
                </span>
                <span className="text-xs font-mono text-slate-300">
                    {formatTime(segment.start)}
                </span>
            </div>
            <p className={`text-lg leading-relaxed ${isActive ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                {segment.text}
            </p>
        </div>
    );
};

// --- Sub-Component: Vocabulary Item ---
const VocabularyItem = ({ item }) => {
    const playPronunciation = (e) => {
        e.stopPropagation();
        if ('speechSynthesis' in window) {
            // Cancel previous
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(item.word);
            utterance.lang = 'fr-FR';
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl mb-3 hover:border-indigo-200 hover:shadow-md transition-all">
            <div className="flex flex-col">
                <div className="flex items-baseline gap-3">
                    <h4 className="text-xl font-bold text-slate-800">{item.word}</h4>
                    <span className="text-sm font-mono text-slate-400 opacity-60">{item.phonetic}</span>
                </div>
                <p className="text-indigo-600 font-medium mt-1">{item.translation}</p>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded hidden sm:block">
                    {item.type}
                </span>
                <button
                    onClick={playPronunciation}
                    className="p-3 rounded-full text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    title="Listen to pronunciation"
                >
                    <Volume2 size={20} />
                </button>
            </div>
        </div>
    );
};

// --- Main Component: Audio Player ---
export default function AudioPlayerPage() {
    const navigate = useNavigate();
    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [volume, setVolume] = useState(1.0);
    const [isMuted, setIsMuted] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('transcript'); // 'transcript' | 'vocabulary'

    // Refs
    const audioRef = useRef(null);
    const progressBarRef = useRef(null);

    // --- Audio Handlers ---

    const togglePlay = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        try {
            if (isPlaying) {
                audio.pause();
            } else {
                await audio.play();
            }
            setIsPlaying(!isPlaying);
            setError(null);
        } catch (err) {
            console.error("Playback error:", err);
            setIsPlaying(false);
            setError("Unable to play audio. The format might not be supported.");
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleError = (e) => {
        console.error("Audio resource error:", e);
        setError("Error loading audio file. Please check your connection.");
        setIsPlaying(false);
    };

    const handleSeek = (e) => {
        const audio = audioRef.current;
        const bar = progressBarRef.current;
        if (!audio || !bar) return;

        const rect = bar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * duration;

        // Check if newTime is finite and valid
        if (Number.isFinite(newTime)) {
            audio.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const skipBackward = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, currentTime - 10);
        }
    };

    const changeSpeed = () => {
        const speeds = [0.75, 1.0, 1.25, 1.5];
        const currentIndex = speeds.indexOf(playbackRate);
        const nextSpeed = speeds[(currentIndex + 1) % speeds.length];

        setPlaybackRate(nextSpeed);
        if (audioRef.current) {
            audioRef.current.playbackRate = nextSpeed;
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const jumpToTime = async (time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            if (!isPlaying) {
                try {
                    await audioRef.current.play();
                    setIsPlaying(true);
                    setError(null);
                } catch (err) {
                    console.error("Jump to time play error:", err);
                }
            }
        }
    };

    // --- Derived State ---
    const activeSegmentId = useMemo(() => {
        const segment = lessonData.transcript.find(
            (s) => currentTime >= s.start && currentTime < s.end
        );
        return segment ? segment.id : null;
    }, [currentTime]);

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans text-slate-900">

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={lessonData.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onError={handleError}
                preload="metadata"
            />

            {/* --- Top Navigation Bar --- */}
            <div className="w-full max-w-3xl mb-4">
                <button
                    onClick={() => navigate('/learning/listening')}
                    className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-medium text-sm"
                >
                    <ChevronLeft size={16} /> Back to Library
                </button>
            </div>

            {/* --- Header Area --- */}
            <header className="w-full max-w-3xl flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-md">
                        <Volume2 size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{lessonData.title}</h2>
                        <p className="text-slate-500 text-sm font-medium">{lessonData.description}</p>
                    </div>
                </div>

                {/* Test Button */}
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all font-bold text-sm">
                    <GraduationCap size={18} />
                    Test
                </button>
            </header>

            <main className="w-full max-w-3xl grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">

                {/* --- Left Col: Audio Controls (Sticky) --- */}
                <section className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 flex flex-col items-center justify-between h-full relative overflow-hidden">

                        {/* Visualizer Art / Placeholder */}
                        <div className="w-full aspect-square bg-indigo-50 rounded-2xl mb-6 flex items-center justify-center relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-white opacity-50"></div>
                            {/* Animated Rings */}
                            {isPlaying && !error && (
                                <>
                                    <div className="absolute w-full h-full border-4 border-indigo-200 rounded-full animate-ping opacity-20"></div>
                                    <div className="absolute w-2/3 h-2/3 border-4 border-indigo-300 rounded-full animate-pulse opacity-30"></div>
                                </>
                            )}
                            {error ? (
                                <AlertCircle className="text-red-400 relative z-10" size={64} />
                            ) : (
                                <Volume2 className={`text-indigo-500 relative z-10 transition-all duration-500 ${isPlaying ? 'scale-110' : 'scale-100'}`} size={64} />
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="text-xs text-red-500 text-center mb-2 px-2 bg-red-50 py-1 rounded">
                                {error}
                            </div>
                        )}

                        {/* Time Display */}
                        <div className="w-full flex justify-between text-sm font-mono text-slate-400 mb-2">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>

                        {/* Progress Bar */}
                        <div
                            className="w-full h-2 bg-slate-100 rounded-full mb-8 cursor-pointer relative group"
                            ref={progressBarRef}
                            onClick={handleSeek}
                        >
                            <div
                                className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all duration-100 group-hover:bg-indigo-600"
                                style={{ width: `${progressPercent}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
                            </div>
                        </div>

                        {/* Main Controls */}
                        <div className="flex items-center gap-6 mb-8">
                            <button
                                onClick={skipBackward}
                                disabled={!!error}
                                className="text-slate-400 hover:text-indigo-500 transition-colors p-2 hover:bg-slate-50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Rewind 10s"
                            >
                                <RotateCcw size={22} />
                            </button>

                            <button
                                onClick={togglePlay}
                                disabled={!!error}
                                className="w-16 h-16 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                            </button>

                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                disabled={!!error}
                                className={`text-slate-400 hover:text-indigo-500 transition-colors p-2 hover:bg-slate-50 rounded-full ${showSettings ? 'bg-slate-100 text-indigo-500' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <Settings2 size={22} />
                            </button>
                        </div>

                        {/* Settings Overlay (Conditional) */}
                        {showSettings && (
                            <div className="absolute bottom-20 left-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2 z-20">
                                <div className="space-y-4">
                                    {/* Speed Control */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold uppercase text-slate-400">Speed</span>
                                        <button
                                            onClick={changeSpeed}
                                            className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                                        >
                                            {playbackRate}x
                                        </button>
                                    </div>

                                    {/* Volume Control */}
                                    <div className="flex justify-between items-center gap-3">
                                        <button onClick={toggleMute} className="text-slate-400 hover:text-slate-600">
                                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                        </button>
                                        <input
                                            type="range"
                                            min="0" max="1" step="0.1"
                                            value={isMuted ? 0 : volume}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                setVolume(val);
                                                if (audioRef.current) audioRef.current.volume = val;
                                                setIsMuted(val === 0);
                                            }}
                                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Switching Buttons */}
                        <div className="mt-auto flex gap-4 w-full">
                            <button
                                onClick={() => setActiveTab('vocabulary')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all border ${activeTab === 'vocabulary'
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                                        : 'text-slate-500 bg-slate-50 hover:bg-slate-100 border-slate-100'
                                    }`}
                            >
                                VOCABULARY
                            </button>
                            <button
                                onClick={() => setActiveTab('transcript')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all border ${activeTab === 'transcript'
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                                        : 'text-slate-500 bg-slate-50 hover:bg-slate-100 border-slate-100'
                                    }`}
                            >
                                TRANSCRIPT
                            </button>
                        </div>
                    </div>
                </section>

                {/* --- Right Col: Content Area (Transcript or Vocab) --- */}
                <section className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden h-full">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 min-h-[60px]">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            {activeTab === 'transcript' ? (
                                <>
                                    <Clock size={16} className="text-indigo-500" />
                                    Transcript
                                </>
                            ) : (
                                <>
                                    <BookOpen size={16} className="text-indigo-500" />
                                    Vocabulary List
                                </>
                            )}
                        </h3>
                        <button className="text-slate-400 hover:text-slate-600" title="Download PDF">
                            <Download size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
                        {activeTab === 'transcript' ? (
                            <>
                                {lessonData.transcript.map((segment) => (
                                    <TranscriptSegment
                                        key={segment.id}
                                        segment={segment}
                                        isActive={activeSegmentId === segment.id}
                                        onClick={jumpToTime}
                                    />
                                ))}
                                <div className="h-20 flex items-center justify-center text-slate-300 text-sm italic">
                                    End of Lesson
                                </div>
                            </>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {lessonData.vocabulary.map((item) => (
                                    <VocabularyItem key={item.id} item={item} />
                                ))}
                                <div className="mt-8 text-center p-6 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                                    <p className="text-slate-400 text-sm">Review these words to master the lesson!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

            </main>

            <div className="mt-12 text-center text-slate-400 text-sm max-w-md">
                {activeTab === 'transcript' ? (
                    <p>Pro Tip: Click any sentence in the transcript to <span className="text-indigo-500 font-semibold">jump to that timestamp</span>.</p>
                ) : (
                    <p>Pro Tip: Click the <span className="text-indigo-500 font-semibold">speaker icon</span> to hear the pronunciation of each word.</p>
                )}
            </div>
        </div>
    );
}
