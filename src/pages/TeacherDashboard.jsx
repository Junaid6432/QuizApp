import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { Plus, Trash2, Edit2, Power, ClipboardList, TrendingUp, ChevronRight, ArrowLeft, Trophy, Users, School, Hash, CheckSquare, Square, FolderTree } from 'lucide-react';
import { CLASSES, BASE_SUBJECTS, HIGH_SCHOOL_SUBJECTS, getSubjectsByClass } from '../constants/collegeData';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';

const TeacherDashboard = () => {
  const { 
    quizzes, toggleQuizActive, deleteQuiz, 
    setGameState, setRole, attempts,
    setEditQuizId, isLoading, emisCode
  } = useQuiz();


  const [filter, setFilter] = useState(() => {
    try {
      const saved = localStorage.getItem('teacher_filters');
      return saved ? JSON.parse(saved) : { class: '', subject: '' };
    } catch (e) {
      return { class: '', subject: '' };
    }
  });

  const [expandedUnits, setExpandedUnits] = useState([]);

  const toggleUnitExpand = (unitName) => {
    setExpandedUnits(prev => 
      prev.includes(unitName) 
        ? prev.filter(u => u !== unitName) 
        : [...prev, unitName]
    );
  };

  // Persist filters
  React.useEffect(() => {
    localStorage.setItem('teacher_filters', JSON.stringify(filter));
  }, [filter]);

  const handleEdit = (quiz) => {
    setEditQuizId(quiz.id);
    setGameState('create-quiz');
  };

  const availableClasses = CLASSES;
  const availableSubjects = useMemo(() => {
    if (!filter.class) return [...new Set([...BASE_SUBJECTS, ...HIGH_SCHOOL_SUBJECTS])];
    return getSubjectsByClass(filter.class);
  }, [filter.class]);

  const filteredQuizzes = quizzes.filter(q => 
    (!filter.class || q.class === filter.class) &&
    (!filter.subject || q.subject === filter.subject)
  );

  // Group quizzes by Unit
  const groupedQuizzes = useMemo(() => {
    const groups = {};
    filteredQuizzes.forEach(quiz => {
      const unit = quiz.unit || 'Other';
      if (!groups[unit]) groups[unit] = [];
      groups[unit].push(quiz);
    });
    
    // Sort keys naturally (Unit 1, Unit 2, etc.)
    return Object.keys(groups)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .reduce((acc, key) => {
        acc[key] = groups[key];
        return acc;
      }, {});
  }, [filteredQuizzes]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const handleToggleUnit = async (unitName, quizzesInUnit) => {
    // Determine if all are currently active
    const allActive = quizzesInUnit.every(q => q.isActive);
    const targetState = !allActive;

    // Toggle all quizzes in this unit to the target state
    for (const quiz of quizzesInUnit) {
      if (quiz.isActive !== targetState) {
        await toggleQuizActive(quiz.id);
      }
    }
  };

  return (
    <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setGameState('home')}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-xl"
            title="Return to Student Portal"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Teacher Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-500 font-medium tracking-tight">Manage your unit quizzes and track performance</p>
              <span className="w-1 h-1 bg-slate-700 rounded-full" />
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                <School className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">School: {emisCode}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setGameState('leaderboard')} 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 border-white/10 hover:border-white/20"
          >
            <Trophy className="w-5 h-5 text-yellow-500" />
            Rankings
          </Button>
          <Button onClick={() => setGameState('create-quiz')} className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 shadow-xl">
            <Plus className="w-5 h-5" />
            Create Quiz
          </Button>
          <Button variant="outline" onClick={() => setGameState('home')} className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 border-white/10 hover:border-white/20">
            <Users className="w-5 h-5 text-emerald-500" />
            Student View
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-500">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Quizzes</p>
            <p className="text-2xl font-bold text-white">{quizzes.length}</p>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-500">
            <Power className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Active Quizzes</p>
            <p className="text-2xl font-bold text-white">{quizzes.filter(q => q.isActive).length}</p>
          </div>
        </GlassCard>
        <GlassCard 
          onClick={() => setGameState('leaderboard')}
          className="p-6 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all group"
        >
          <div className="p-3 bg-amber-500/20 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-400">Student Attempts</p>
            <p className="text-2xl font-bold text-white">{attempts.length}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
        </GlassCard>
      </div>

      {/* Quiz Management */}
      <GlassCard className="overflow-hidden max-w-none mx-0 border-white/10">
        <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between">
          <h2 className="text-xl font-bold text-white">Manage Assessments</h2>
          <div className="flex gap-4">
            <div className="relative">
              <select 
                value={filter.class} 
                onChange={(e) => setFilter({...filter, class: e.target.value, subject: ''})}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none appearance-none pr-10 font-bold cursor-pointer hover:border-white/20 transition-colors"
              >
                <option value="" className="bg-slate-900">All Classes</option>
                {availableClasses.map(c => <option key={c} value={c} className="bg-slate-900">Grade {c}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
            
            <div className="relative">
              <select 
                value={filter.subject} 
                onChange={(e) => setFilter({...filter, subject: e.target.value})}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none appearance-none pr-10 font-bold cursor-pointer hover:border-white/20 transition-colors"
              >
                <option value="" className="bg-slate-900">All Subjects</option>
                {availableSubjects.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-sm uppercase">
                <th className="px-6 py-4">Title / Unit</th>
                <th className="px-6 py-4 text-center">Class</th>
                <th className="px-6 py-4 text-center">Questions</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {Object.keys(groupedQuizzes).length > 0 ? Object.entries(groupedQuizzes).map(([unitName, unitQuizzes]) => {
                const isExpanded = expandedUnits.includes(unitName);
                return (
                <React.Fragment key={unitName}>
                  {/* Unit Header Row */}
                  <tr 
                    onClick={() => toggleUnitExpand(unitName)}
                    className="bg-blue-900/40 border-y border-white/5 group/header cursor-pointer hover:bg-blue-900/60 transition-colors"
                  >
                    <td colSpan="3" className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <motion.div 
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          className="text-blue-400 opacity-50 group-hover/header:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </motion.div>
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-blue-500/20 rounded-lg">
                            <FolderTree className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-base font-black text-white tracking-wide uppercase">{unitName}</span>
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md font-bold">
                            {unitQuizzes.length} TOPICS
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Stop from collapsing when clicking button
                            handleToggleUnit(unitName, unitQuizzes);
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all border ${
                            unitQuizzes.every(q => q.isActive)
                              ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                              : 'bg-slate-800 text-slate-400 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {unitQuizzes.every(q => q.isActive) ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                          {unitQuizzes.every(q => q.isActive) ? 'UNIT ACTIVE' : 'ACTIVATE UNIT'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Actions Column Placeholder */}
                    </td>
                  </tr>

                  {/* Individual Topics (Accordion Content) */}
                  <AnimatePresence mode="popLayout">
                    {isExpanded && unitQuizzes.map((quiz, idx) => (
                      <motion.tr 
                        key={quiz.id} 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="group border-b border-white/5 hover:bg-white/5 transition-colors overflow-hidden"
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-start gap-4 ml-8 md:ml-12 lg:ml-14">
                            <div className="mt-1 flex flex-col items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              {idx < unitQuizzes.length - 1 && <div className="w-px h-10 bg-slate-700" />}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold flex items-center gap-2 truncate">
                                <span className="text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight">{quiz.subject}</span>
                                {quiz.isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                              </div>
                              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{quiz.topicName || 'General Assessment'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className="inline-flex items-center justify-center bg-white/5 border border-white/10 rounded-lg w-8 h-8 text-slate-300 font-bold text-sm">
                            {quiz.class}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-white leading-none">{quiz.questionLimit || quiz.questions.length}</span>
                            <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">
                              Pool: {quiz.questions.length}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <button 
                              onClick={() => toggleQuizActive(quiz.id)}
                              className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-tighter transition-all ${
                                quiz.isActive 
                                  ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' 
                                  : 'bg-slate-500/20 text-slate-400 border border-white/10'
                              }`}
                            >
                              {quiz.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(quiz)}
                              className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                              title="Edit Topic"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => deleteQuiz(quiz.id)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                              title="Delete Topic"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </React.Fragment>
              )}) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                    No assessments found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default TeacherDashboard;
