import React, { useState, useEffect, useMemo } from 'react';
import { useQuiz } from '../context/QuizContext';
import { CLASSES, getSubjectsByClass } from '../constants/collegeData';
import { Trophy, Sparkles, ChevronRight, School, Hash, UserCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const StudentEntry = () => {
    const { setGameState, setSelectedUnit, setStudentData, attempts, emisCode, setEmisCode } = useQuiz();

    const [formData, setFormData] = useState({
        studentName: '',
        rollNo: '',
        grade: CLASSES[0] || '9',
        subject: '',
        emisCode: emisCode || 'GPSK001'
    });

    const [isGradeTouched, setIsGradeTouched] = useState(false);


    // Load existing data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem('studentData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setFormData(prev => ({
                    ...prev,
                    ...parsed
                }));
            } catch (e) {
                console.error("Failed to parse studentData from localStorage", e);
            }
        }
    }, []);

    // Update subject options when grade changes
    const subjects = getSubjectsByClass(formData.grade);
    
    useEffect(() => {
        if (!formData.subject || !subjects.includes(formData.subject)) {
            setFormData(prev => ({ ...prev, subject: subjects[0] || '' }));
        }
    }, [formData.grade, subjects]);

    // Update global context when EMIS in form changes (or at least when starting)
    useEffect(() => {
        if (formData.emisCode !== emisCode) {
            setEmisCode(formData.emisCode);
        }
    }, [formData.emisCode]);

    const handleStart = () => {
        const { studentName, rollNo, grade, subject } = formData;

        if (!studentName.trim() || !rollNo.trim()) {
            return alert('Please enter Name and Roll Number');
        }

        const data = {
            studentName: studentName.trim(),
            rollNo: rollNo.trim(),
            grade,
            subject
        };

        setStudentData(data);
        setGameState('home');
    };

    // Filtered Champions Preview
    const filteredChampions = useMemo(() => {
        let results = [];
        
        if (isGradeTouched && formData.subject) {
            results = [...attempts].filter(a => 
                a.class === formData.grade && 
                a.subject === formData.subject
            );
            
            // If no real records for this subject, return empty so we show the "Be the first" message
            if (results.length === 0) return [];
        } else {
            // Overall: Highest percentage attempts across all
            // IMPORTANT: Clone the array before sorting to avoid mutating context state!
            results = [...attempts].sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
        }

        return results.slice(0, 3).map((r, i) => ({ ...r, rank: i + 1 }));
    }, [attempts, formData.grade, formData.subject, isGradeTouched]);

    const formatTimeShort = (seconds) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };


    return (
        <div className="min-h-screen bg-transparent text-white p-4 md:p-8 font-['Plus_Jakarta_Sans']">



            <main className="max-w-xl mx-auto">
                {/* Entry Card */}
                <div className="w-full">
                    <div className="welcome-card shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-shadow duration-700 rounded-3xl p-8 bg-[#1a233a] border border-blue-900/40 relative overflow-hidden">
                        {/* Static Backdrop Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none" />
                        
                        <div className="text-center mb-10 relative z-10">
                            <div className="bg-blue-600 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-xl shadow-blue-600/30 font-black text-3xl">Q</div>
                            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Student Portal</h1>
                            <p className="text-blue-300/60 text-sm">Enter your details to start</p>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <label className="block text-[12px] font-bold text-blue-400/80 mb-2 uppercase tracking-widest">Full Name</label>
                                <input 
                                    id="studentName" 
                                    type="text" 
                                    placeholder="e.g. Junaid Ur Rehman" 
                                    value={formData.studentName}
                                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-blue-500/30 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium focus:brightness-110"
                                />
                            </div>
                            <div>
                                <label className="block text-[12px] font-bold text-blue-400/80 mb-2 uppercase tracking-widest">Roll Number</label>
                                <input 
                                    id="rollNo" 
                                    type="number" 
                                    placeholder="Enter Roll No" 
                                    value={formData.rollNo}
                                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-blue-500/30 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:brightness-110"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[12px] font-bold text-blue-400/80 mb-2 uppercase tracking-widest">Grade</label>
                                    <select 
                                        id="grade" 
                                        value={formData.grade}
                                        onChange={(e) => { 
                                            setFormData({ ...formData, grade: e.target.value });
                                            setIsGradeTouched(true);
                                        }}
                                        className="w-full bg-[#0f172a] border border-blue-900/30 rounded-2xl px-4 py-4 text-white outline-none cursor-pointer hover:border-blue-500/50 transition-all font-bold text-lg"
                                    >
                                        {CLASSES.map(c => (
                                            <option key={c} value={c} className="bg-[#0f172a]">Grade {c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-blue-400/80 mb-2 uppercase tracking-widest">Subject</label>
                                    <select 
                                        id="subject" 
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-blue-900/30 rounded-2xl px-4 py-4 text-white outline-none cursor-pointer hover:border-blue-500/50 transition-all font-bold text-lg"
                                    >
                                        {subjects.map(s => (
                                            <option key={s} value={s} className="bg-[#0f172a]">{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-[12px] font-bold text-blue-400/80 mb-2 uppercase tracking-widest flex items-center gap-2">
                                    <Hash className="w-3 h-3" />
                                    School / EMIS Code
                                </label>
                                <div className="relative">
                                    <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input 
                                        type="text" 
                                        placeholder="e.g. GPSK001" 
                                        value={formData.emisCode}
                                        onChange={(e) => setFormData({ ...formData, emisCode: e.target.value.toUpperCase() })}
                                        className="w-full bg-[#0f172a] border border-blue-500/30 rounded-2xl pl-11 pr-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold placeholder:text-slate-600 focus:brightness-110"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2 italic px-1">Tip: Ask your teacher for the school code to see your tests.</p>
                            </div>

                            <button 
                                onClick={handleStart} 
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold py-5 rounded-2xl shadow-2xl active:scale-[0.98] transition-all mt-4 hover:shadow-blue-500/40 uppercase tracking-widest text-sm"
                            >
                                Start My Quiz
                            </button>

                            {localStorage.getItem('studentData') && (
                                <button 
                                    onClick={() => setGameState('leaderboard')}
                                    className="w-full bg-white/5 border border-white/10 text-slate-300 font-bold py-4 rounded-2xl active:scale-[0.98] transition-all mt-2 hover:bg-white/10 hover:text-white flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                                >
                                    Class Rankings
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentEntry;
