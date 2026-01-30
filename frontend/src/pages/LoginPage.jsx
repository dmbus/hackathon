import { signInWithPopup } from "firebase/auth";
import { ArrowRight, Lock, Mail, Sparkles, User } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import InputField from '../components/InputField';
import SocialButton, { GithubIcon, GoogleIcon } from '../components/SocialButton';
import { api, API_BASE_URL } from '../services/api';
import { auth, githubProvider, googleProvider } from '../services/firebase';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setError('');
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setSuccess('');
    };

    const handleSocialLogin = async (providerName) => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            let provider;
            if (providerName === 'google') {
                provider = googleProvider;
            } else if (providerName === 'github') {
                provider = githubProvider;
            } else {
                throw new Error('Unsupported provider');
            }

            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            // Send token to backend
            const response = await api.post('/auth/firebase-login', { idToken });

            console.log('Social Login Success:', response.data);
            setSuccess('Successfully logged in with ' + providerName + '!');
            localStorage.setItem('token', idToken);

        } catch (err) {
            console.error('Social Login Error:', err);
            setError(err.response?.data?.detail || err.message || 'Social login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = {
                email: formData.email,
                password: formData.password,
                ...(isLogin ? {} : { name: formData.name })
            };

            const response = await api.post(endpoint, payload);

            console.log('Success:', response.data);
            setSuccess(isLogin ? 'Successfully logged in!' : 'Account created successfully!');

            // Store token
            localStorage.setItem('token', response.data.idToken);

        } catch (err) {
            console.error('API Error:', err);
            let errorMsg = 'An unexpected error occurred. Please try again.';

            if (err.response) {
                // Server responded with a status code outside the 2xx range
                errorMsg = err.response.data?.detail || `Error ${err.response.status}: ${err.response.statusText}`;
            } else if (err.request) {
                // Request was made but no response was received
                errorMsg = `Cannot connect to server at ${API_BASE_URL}. Please check if the backend is running.`;
            } else {
                // Something happened in setting up the request that triggered an Error
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
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-slate-500 text-lg">
                            {isLogin ? 'Ready to continue your journey?' : 'Start your experience today.'}
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
                            {!isLogin && (
                                <div className="animate-fade-in-down">
                                    <InputField
                                        id="name"
                                        label="Full Name"
                                        type="text"
                                        placeholder="Jane Doe"
                                        icon={User}
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}

                            <InputField
                                id="email"
                                label="Email Address"
                                type="email"
                                placeholder="hello@example.com"
                                icon={Mail}
                                value={formData.email}
                                onChange={handleChange}
                            />

                            <div className="space-y-1">
                                <InputField
                                    id="password"
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    icon={Lock}
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                {isLogin && (
                                    <div className="flex justify-end pt-1">
                                        <Link to="/login/recovery" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                            Forgot password?
                                        </Link>
                                    </div>
                                )}
                            </div>

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
                                        <span>Processing...</span>
                                    </span>
                                ) : (
                                    <>
                                        <span>{isLogin ? 'Sign In' : 'Get Started'}</span>
                                        <ArrowRight size={20} strokeWidth={2.5} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-white text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <SocialButton icon={GoogleIcon} label="Google" onClick={() => handleSocialLogin('google')} />
                            <SocialButton icon={GithubIcon} label="GitHub" onClick={() => handleSocialLogin('github')} />
                        </div>
                    </div>

                    <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 text-center">
                        <p className="text-slate-600">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                            <button
                                onClick={toggleMode}
                                className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors ml-1 focus:outline-none focus:underline"
                            >
                                {isLogin ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <p className="font-mono text-sm text-slate-400 opacity-80">
                        Sprache.app Secure Login
                    </p>
                </div>
            </div>
        </div>
    );
}
