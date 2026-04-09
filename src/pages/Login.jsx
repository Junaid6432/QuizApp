import React, { useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { LogIn, Lock, Mail, AlertCircle, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const { setGameState, setRole } = useQuiz();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            setRole('teacher');
            setGameState('dashboard');
        } catch (err) {
            console.error(err);
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            setRole('teacher');
            setGameState('dashboard');
        } catch (err) {
            console.error(err);
            setError('Google Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-transparent font-['Plus_Jakarta_Sans']">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-[#1a233a] border border-blue-900/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Backdrop Glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none" />
                    
                    <button 
                        onClick={() => setGameState('student-entry')}
                        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Student Portal
                    </button>

                    <div className="text-center mb-10 relative z-10">
                        <div className="bg-blue-600 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-xl shadow-blue-600/30">
                            <LogIn className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Teacher Login</h1>
                        <p className="text-blue-300/60 text-sm">Access your dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-[12px] font-bold text-blue-400/80 mb-2 uppercase tracking-widest">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input 
                                    type="email" 
                                    placeholder="teacher@gpskunda.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-[#0f172a] border border-blue-500/30 rounded-2xl pl-14 pr-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[12px] font-bold text-blue-400/80 mb-2 uppercase tracking-widest">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-[#0f172a] border border-blue-500/30 rounded-2xl pl-14 pr-12 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold py-5 rounded-2xl shadow-2xl active:scale-[0.98] transition-all mt-4 hover:shadow-blue-500/40 uppercase tracking-widest text-sm disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Login to Portal'
                            )}
                        </button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1a233a] px-4 text-slate-500 font-bold tracking-widest">Or continue with</span></div>
                        </div>

                        <button 
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-all active:scale-[0.98] shadow-xl"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                            Sign in with Google
                        </button>

                        <p className="text-center text-slate-500 text-xs font-medium mt-8">
                            Don't have an account? {' '}
                            <button 
                                type="button"
                                onClick={() => setGameState('signup')}
                                className="text-blue-400 font-black hover:text-blue-300 transition-colors uppercase tracking-widest"
                            >
                                Register here
                            </button>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
