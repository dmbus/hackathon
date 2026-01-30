import { ArrowLeft, Mail, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from '../components/InputField';
import { api, API_BASE_URL } from '../services/api';

export default function RecoveryPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/auth/recover', { email });
            setSuccess(response.data.message || 'If an account exists for this email, you will receive a password reset link.');
        } catch (err) {
            console.error('Recovery Error:', err);
            let errorMsg = 'An unexpected error occurred. Please try again.';

            if (err.response) {
                errorMsg = err.response.data?.detail || `Error ${err.response.status}: ${err.response.statusText}`;
            } else if (err.request) {
                errorMsg = `Cannot connect to server at ${API_BASE_URL}. Please check if the backend is running.`;
            } else {
                errorMsg = err.message;
            }

            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-rose-50 rounded-full blur-3xl opacity-60"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">

                    <div className="px-8 pt-10 pb-6 text-center">
                        <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-sm border border-indigo-100">
                            <Sparkles size={28} strokeWidth={2} />
                        </div>

                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-2">
                            Forgot Password?
                        </h1>
                        <p className="text-slate-500 text-lg">
                            No worries, we'll send you reset instructions.
                        </p>
                    </div>

                    <div className="px-8 pb-10">
                        {error && (
                            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium animate-fade-in-down">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-sm font-medium animate-fade-in-down">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <InputField
                                id="email"
                                label="Email Address"
                                type="email"
                                placeholder="hello@example.com"
                                icon={Mail}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 px-6 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg shadow-indigo-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 ${isLoading ? 'cursor-wait' : ''}`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Sending...</span>
                                    </span>
                                ) : (
                                    <>
                                        <span>Send Reset Link</span>
                                        <Send size={20} strokeWidth={2.5} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 text-center">
                        <Link to="/login" className="flex items-center justify-center font-bold text-slate-600 hover:text-slate-800 transition-colors gap-2">
                            <ArrowLeft size={18} />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
