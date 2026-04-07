import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { CLASSES, getSubjectsByClass } from '../constants/collegeData';
import { Trophy, ChevronLeft, Filter, Search, Award, Clock, Star } from 'lucide-react';

const Leaderboard = () => {
    const { attempts, setGameState, quizzes, studentData } = useQuiz();
    const [filters, setFilters] = useState({
        grade: studentData?.grade || '',
        subject: studentData?.subject || '',
        unit: '',
        topic: ''
    });

    // Mock initial data to populate the global leaderboard if no real attempts exist
    const globalMockData = [
        { studentName: "Ali Ahmed", rollNo: "101", class: "9", subject: "Maths", score: 10, total: 10, percentage: 100, timeTaken: 120, timestamp: new Date().toISOString() },
        { studentName: "Fatima Noor", rollNo: "102", class: "10", subject: "Biology", score: 9, total: 10, percentage: 90, timeTaken: 145, timestamp: new Date().toISOString() },
        { studentName: "Umar Khan", rollNo: "103", class: "8", subject: "Science", score: 9, total: 10, percentage: 90, timeTaken: 180, timestamp: new Date().toISOString() },
        { studentName: "Zainab Bibi", rollNo: "104", class: "9", subject: "English", score: 8, total: 10, percentage: 80, timeTaken: 110, timestamp: new Date().toISOString() },
        { studentName: "Hassan Ali", rollNo: "105", class: "7", subject: "Maths", score: 8, total: 10, percentage: 80, timeTaken: 130, timestamp: new Date().toISOString() }
    ];

    const allAttempts = useMemo(() => {
        // Merge real attempts with mock data (mock data only if very few real attempts exist or just for demo)
        const combined = [...attempts];
        if (combined.length < 3) combined.push(...globalMockData);
        return combined;
    }, [attempts]);

    // Dynamic Filter Options
    const availableSubjects = filters.grade ? getSubjectsByClass(filters.grade) : [];
    
    const availableUnits = useMemo(() => {
        if (!filters.grade || !filters.subject) return [];
        const units = quizzes
            .filter(q => q.class === filters.grade && q.subject === filters.subject)
            .map(q => q.unit);
        return [...new Set(units)];
    }, [quizzes, filters.grade, filters.subject]);

    const availableTopics = useMemo(() => {
        if (!filters.grade || !filters.subject || !filters.unit) return [];
        return quizzes
            .filter(q => q.class === filters.grade && q.subject === filters.subject && q.unit === filters.unit)
            .map(q => q.topicName || 'General Assessment');
    }, [quizzes, filters.grade, filters.subject, filters.unit]);

    // Filtering Logic
    const filteredResults = useMemo(() => {
        let results = [...allAttempts];

        if (filters.grade) results = results.filter(r => r.class === filters.grade);
        if (filters.subject) results = results.filter(r => r.subject === filters.subject);
        if (filters.unit) results = results.filter(r => r.unit === filters.unit);
        if (filters.topic) results = results.filter(r => r.topicName === filters.topic);

        // Sort by Percentage (Desc) then Time Taken (Asc)
        return results.sort((a, b) => {
            if (b.percentage !== a.percentage) return b.percentage - a.percentage;
            return (a.timeTaken || 0) - (b.timeTaken || 0);
        });
    }, [allAttempts, filters]);

    const formatTime = (seconds) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setGameState(studentData ? 'home' : 'student-entry')}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-xl"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-yellow-500" />
                            Leaderboard
                        </h1>
                        <p className="text-slate-500 font-medium">Tracking excellence across GPS Kunda</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl text-blue-400 text-xs font-bold uppercase tracking-widest">
                    <Award className="w-4 h-4" />
                    {filters.grade ? `Grade ${filters.grade} Champions` : 'Global Champions'}
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="relative group">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Select Grade</label>
                    <div className="relative">
                        <select 
                            value={filters.grade}
                            onChange={(e) => setFilters({ ...filters, grade: e.target.value, subject: '', unit: '', topic: '' })}
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer font-bold"
                        >
                            <option value="">All Grades (Global)</option>
                            {CLASSES.map(c => <option key={c} value={c}>Grade {c}</option>)}
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                    </div>
                </div>

                <div className="relative group">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Subject</label>
                    <div className="relative">
                        <select 
                            value={filters.subject}
                            onChange={(e) => setFilters({ ...filters, subject: e.target.value, unit: '', topic: '' })}
                            disabled={!filters.grade}
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">Select Subject</option>
                            {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                    </div>
                </div>

                <div className="relative group">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Unit</label>
                    <div className="relative">
                        <select 
                            value={filters.unit}
                            onChange={(e) => setFilters({ ...filters, unit: e.target.value, topic: '' })}
                            disabled={!filters.subject}
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">Select Unit</option>
                            {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <Star className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                    </div>
                </div>

                <div className="relative group">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block ml-1">Topic</label>
                    <div className="relative">
                        <select 
                            value={filters.topic}
                            onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                            disabled={!filters.unit}
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3.5 text-white outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">Select Topic</option>
                            {availableTopics.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <Award className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="flex-1 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/30 border-b border-slate-800">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rank</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:table-cell">Roll No</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest hidden lg:table-cell">Academic Context</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Score</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            <AnimatePresence mode="popLayout">
                                {filteredResults.length > 0 ? filteredResults.map((res, idx) => (
                                    <motion.tr 
                                        key={res.id || idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm ${
                                                idx === 0 ? 'bg-yellow-500/20 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 
                                                idx === 1 ? 'bg-slate-300/20 text-slate-300' : 
                                                idx === 2 ? 'bg-amber-700/20 text-amber-600' :
                                                'bg-slate-800 text-slate-500'
                                            }`}>
                                                {idx + 1}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div>
                                                <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{res.studentName}</p>
                                                <p className="text-[10px] text-slate-500 font-medium md:hidden">Roll: {res.rollNo}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 hidden md:table-cell">
                                            <span className="text-sm font-medium text-slate-400">{res.rollNo}</span>
                                        </td>
                                        <td className="px-8 py-6 hidden lg:table-cell">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-slate-800 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-400 uppercase tracking-wider border border-slate-700">G-{res.class}</span>
                                                <span className="bg-blue-500/10 px-2.5 py-1 rounded-md text-[10px] font-bold text-blue-400 uppercase tracking-wider border border-blue-500/10">{res.subject}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-lg text-white">{res.percentage}%</span>
                                                <div className="h-1.5 w-12 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${res.percentage}%` }}
                                                        className={`h-full ${res.percentage >= 80 ? 'bg-emerald-500' : res.percentage >= 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Clock className="w-3.5 h-3.5 opacity-50" />
                                                <span className="text-sm font-mono font-bold tracking-tighter">{formatTime(res.timeTaken)}</span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-slate-800/50 rounded-3xl flex items-center justify-center text-slate-600">
                                                    <Search className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-slate-400">No results found</p>
                                                    <p className="text-sm text-slate-600">Try adjusting your filters or be the first to take the quiz!</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
