import React, { useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import { auth, googleProvider } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { saveTeacherProfileToDb } from '../lib/firestore';
import { UserPlus, Lock, Mail, AlertCircle, ChevronLeft, Eye, EyeOff, School, Award, Hash, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
    const { setGameState, setRole } = useQuiz();
    const [formData, setFormData] = useState({
        displayName: '',
        designation: 'PST',
        schoolName: '',
        emisCode: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            
            // Save additional metadata to Firestore
            await saveTeacherProfileToDb(userCredential.user.uid, {
                displayName: formData.displayName,
                designation: formData.designation,
                schoolName: formData.schoolName,
                emisCode: formData.emisCode,
                email: formData.email,
                role: 'teacher'
            });

            setRole('teacher');
            setGameState('dashboard');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Signup failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            // Check if profile exists; if not, they still need to provide school/EMIS
            // For now, we'll mark it as needing completion or use default
            await saveTeacherProfileToDb(result.user.uid, {
                displayName: result.user.displayName,
                email: result.user.email,
                role: 'teacher',
                // These will be empty and should be filled in the dashboard later
                schoolName: 'Pending Setup',
                emisCode: '000000',
                designation: 'PST'
            });
            setRole('teacher');
            setGameState('dashboard');
        } catch (err) {
            console.error(err);
            setError('Google Signup failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-transparent font-['Plus_Jakarta_Sans']">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                <div className="bg-[#1a233a] border border-blue-900/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none" />
                    
                    <button 
                        onClick={() => setGameState('login')}
                        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Login
                    </button>

                    <div className="text-center mb-10 relative z-10">
                        <div className="bg-emerald-600 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-xl shadow-emerald-600/30">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Teacher Signup</h1>
                        <p className="text-blue-300/60 text-sm">Join the GPS Kunda Smart Portal</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4 relative z-10">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-blue-400/80 mb-2 uppercase tracking-widest">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Junaid Ur Rehman" 
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        required
                                        className="w-full bg-[#0f172a] border border-blue-500/30 rounded-2xl pl-11 pr-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-blue-400/80 mb-2 uppercase tracking-widest">Designation</label>
                                <div className="relative">
                                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                    <select 
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-blue-500/30 rounded-2xl pl-11 pr-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="PST">PST</option>
                                        <option value="EST">EST</option>
                                        <option value="SST">SST</option>
                                        <option value="Head Teacher">Head Teacher</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-blue-400/80 mb-2 uppercase tracking-widest">School Name</label>
                                <div className="relative">
                                    <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input 
                                        type="text" 
                                        placeholder="GPS No 4 Kunda" 
                                        value={formData.schoolName}
                                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                                        required
                                        className="w-full bg-[#0f172a] border border-blue-500/30 rounded-2xl pl-11 pr-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-blue-400/80 mb-2 uppercase tracking-widest">EMIS Code</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input 
                                        type="text" 
                                        placeholder="123456" 
                                        value={formData.emisCode}
                                        onChange={(e) => setFormData({ ...formData, emisCode: e.target.value })}
                                        required
                                        className="w-full bg-[#0f172a] border border-blue-500/30 rounded-2xl pl-11 pr-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-blue-400/80 mb-2 uppercase tracking-widest">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="email" 
                                    placeholder="teacher@example.com" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full bg-[#0f172a] border border-blue-500/30 rounded-2xl pl-11 pr-4 py-3.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-blue-400/80 mb-2 uppercase tracking-widest">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className="w-full bg-[#0f172a] border border-blue-500/30 rounded-2xl pl-11 pr-12 py-3.5 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold py-5 rounded-2xl shadow-2xl active:scale-[0.98] transition-all mt-4 hover:shadow-emerald-500/40 uppercase tracking-widest text-sm disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Complete Registration'
                            )}
                        </button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1a233a] px-4 text-slate-500 font-bold tracking-widest">Or continue with</span></div>
                        </div>

                        <button 
                            type="button"
                            onClick={handleGoogleSignup}
                            className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-all active:scale-[0.98] shadow-xl"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                            Sign up with Google
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
