import { ArrowLeft, ChevronLeft, ChevronRight, Languages, RotateCw, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// --- Mock Data ---
// In a real app, we would fetch this based on the deck ID
const vocabularyData = [
    {
        id: 1,
        targetWord: "Bonjour",
        translation: "Hello",
        language: "fr-FR",
        phonetic: "/bɔ̃.ʒuʁ/"
    },
    {
        id: 2,
        targetWord: "Bibliothèque",
        translation: "Library",
        language: "fr-FR",
        phonetic: "/bi.bli.jɔ.tɛk/"
    },
    {
        id: 3,
        targetWord: "Heureux",
        translation: "Happy",
        language: "fr-FR",
        phonetic: "/œ.ʁø/"
    },
    {
        id: 4,
        targetWord: "Pamplemousse",
        translation: "Grapefruit",
        language: "fr-FR",
        phonetic: "/pɑ̃.plə.mus/"
    }
];

// --- Flashcard Component ---
const Flashcard = ({ data }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isPlaying, setIsPlaying] = useState(null); // 'male' | 'female' | null

    // Reset flip state when card changes
    useEffect(() => {
        setIsFlipped(false);
    }, [data]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const playAudio = (e, gender) => {
        e.stopPropagation(); // Prevent card flip when clicking audio

        if (!('speechSynthesis' in window)) {
            alert("Text-to-speech not supported in this browser.");
            return;
        }

        // Stop any current playing audio
        window.speechSynthesis.cancel();
        setIsPlaying(gender);

        const utterance = new SpeechSynthesisUtterance(data.targetWord);
        utterance.lang = data.language;
        utterance.rate = 0.9; // Slightly slower for learning

        // Simple heuristic for gender variation if specific voices aren't available
        // High pitch for 'female', Lower pitch for 'male'
        if (gender === 'female') {
            utterance.pitch = 1.2;
        } else {
            utterance.pitch = 0.7;
        }

        utterance.onend = () => setIsPlaying(null);
        utterance.onerror = () => setIsPlaying(null);

        window.speechSynthesis.speak(utterance);
    };

    return (
        <div
            className="group perspective-1000 w-full max-w-md h-80 cursor-pointer"
            onClick={handleFlip}
        >
            <div
                className={`relative w-full h-full transition-all duration-500 transform-style-3d shadow-xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* --- Front Side (Target Word) --- */}
                <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl flex flex-col items-center justify-center border border-slate-200">

                    {/* Audio Controls (Top Right) */}
                    <div className="absolute top-4 right-4 flex gap-3">
                        {/* Female Voice (Red) */}
                        <button
                            onClick={(e) => playAudio(e, 'female')}
                            className={`p-2 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-200 ${isPlaying === 'female'
                                    ? 'bg-rose-100 text-rose-600 ring-2 ring-rose-400'
                                    : 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                                }`}
                            aria-label="Listen to female pronunciation"
                            title="Female Voice"
                        >
                            <Volume2 size={24} strokeWidth={2.5} />
                        </button>

                        {/* Male Voice (Blue) */}
                        <button
                            onClick={(e) => playAudio(e, 'male')}
                            className={`p-2 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-200 ${isPlaying === 'male'
                                    ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-400'
                                    : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
                                }`}
                            aria-label="Listen to male pronunciation"
                            title="Male Voice"
                        >
                            <Volume2 size={24} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Center Content */}
                    <div className="text-center px-6">
                        <span className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            French
                        </span>
                        <h2 className="text-5xl font-bold text-slate-800 tracking-tight mb-2">
                            {data.targetWord}
                        </h2>
                        {data.phonetic && (
                            <p className="text-slate-400 font-mono text-lg opacity-80">
                                {data.phonetic}
                            </p>
                        )}
                    </div>

                    <div className="absolute bottom-6 text-slate-300 text-sm font-medium flex items-center gap-2">
                        <RotateCw size={14} /> Click to flip
                    </div>
                </div>

                {/* --- Back Side (Translation) --- */}
                <div
                    className="absolute w-full h-full backface-hidden bg-indigo-600 rounded-2xl flex flex-col items-center justify-center rotate-y-180 text-white shadow-inner"
                >
                    <div className="text-center px-6">
                        <span className="block text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-3">
                            English Translation
                        </span>
                        <h2 className="text-4xl font-bold tracking-tight">
                            {data.translation}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Application Container ---
const FlashcardsPage = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { id } = useParams();
    const navigate = useNavigate();

    const nextCard = () => {
        setCurrentIndex((prev) => (prev + 1) % vocabularyData.length);
    };

    const prevCard = () => {
        setCurrentIndex((prev) => (prev - 1 + vocabularyData.length) % vocabularyData.length);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans text-slate-900">
            {/* Back Button */}
            <div className="w-full max-w-2xl mb-4">
                <button
                    onClick={() => navigate(`/learning/words/${id}`)}
                    className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Deck
                </button>
            </div>

            {/* Header */}
            <header className="mb-12 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-xl shadow-lg mb-4">
                    <Languages className="text-white" size={32} />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                    LingoFlash
                </h1>
                <p className="text-slate-500 mt-2">Master your vocabulary, one card at a time.</p>
            </header>

            {/* Card Container */}
            <main className="w-full max-w-2xl flex flex-col items-center gap-8">

                <Flashcard
                    data={vocabularyData[currentIndex]}
                />

                {/* Navigation Controls */}
                <div className="flex items-center gap-8 mt-4">
                    <button
                        onClick={prevCard}
                        className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-indigo-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95"
                        aria-label="Previous card"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="text-sm font-medium text-slate-400">
                        {currentIndex + 1} / {vocabularyData.length}
                    </div>

                    <button
                        onClick={nextCard}
                        className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-indigo-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95"
                        aria-label="Next card"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </main>

            {/* Footer Instructions */}
            <div className="mt-16 text-center text-slate-400 text-sm max-w-md">
                <p>Pro Tip: Use the <span className="text-indigo-500 font-semibold">Red</span> button for female pronunciation and the <span className="text-indigo-500 font-semibold">Blue</span> button for male.</p>
            </div>

            <style>{`
        /* * Tailwind provides standard transforms, but some browsers 
         * need specific utilities for backface visibility and 3D preservation 
         */
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
        </div>
    );
};

export default FlashcardsPage;
