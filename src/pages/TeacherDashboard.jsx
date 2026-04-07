import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { Plus, Trash2, Edit2, Power, ClipboardList, TrendingUp, ChevronRight, ArrowLeft } from 'lucide-react';
import { CLASSES, BASE_SUBJECTS, HIGH_SCHOOL_SUBJECTS, getSubjectsByClass } from '../constants/collegeData';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';

const TeacherDashboard = () => {
  const { 
    quizzes, toggleQuizActive, deleteQuiz, 
    setGameState, setRole, attempts,
    setEditQuizId
  } = useQuiz();
  const [filter, setFilter] = useState({ class: '', subject: '' });

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
            <p className="text-slate-500 font-medium tracking-tight">Manage your unit quizzes and track performance</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button onClick={() => setGameState('create-quiz')} className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 shadow-xl">
            <Plus className="w-5 h-5" />
            Create Quiz
          </Button>
          <Button variant="outline" onClick={() => setGameState('home')} className="flex-1 md:flex-none flex items-center justify-center gap-2 py-3 px-6 border-white/10 hover:border-white/20">
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
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 rounded-xl text-amber-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Student Attempts</p>
            <p className="text-2xl font-bold text-white">{attempts.length}</p>
          </div>
        </GlassCard>
      </div>

      {/* Quiz Management */}
      <GlassCard className="overflow-hidden">
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
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Questions</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz, idx) => (
                <motion.tr key={`${quiz.id}-${idx}`} layout className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold">{quiz.subject}</div>
                    <div className="text-xs text-slate-400">{quiz.unit}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{quiz.class}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{quiz.questionLimit || quiz.questions.length}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">
                      Pool: {quiz.questions.length}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => toggleQuizActive(quiz.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
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
                        title="Edit Quiz"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteQuiz(quiz.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Quiz"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No quizzes found matching filters.
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
