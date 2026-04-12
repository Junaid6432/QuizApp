import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { Trophy, Compass, CheckCircle2, AlertCircle, Users, GraduationCap, Zap, ChevronRight, UserCircle2, TrendingUp } from 'lucide-react';
import { CLASSES, getSubjectsByClass } from '../constants/collegeData';

const Home = () => {
  const { quizzes, setGameState, setSelectedUnit, attempts, studentData, isLoading, isFirebaseConfigured, setStudentData } = useQuiz();


  const [selection, setSelection] = useState(() => {
    try {
      const saved = localStorage.getItem('home_selection');
      return saved ? JSON.parse(saved) : { class: '', subject: '' };
    } catch (e) {
      return { class: '', subject: '' };
    }
  });

  // Sync selection with student data on mount/change
  useEffect(() => {
    if (studentData && !selection.class) {
      setSelection({
        class: studentData.grade || '',
        subject: studentData.subject || ''
      });
    }
  }, [studentData]);

  // Persist and Sync back to StudentData
  useEffect(() => {
    localStorage.setItem('home_selection', JSON.stringify(selection));
    
    // Also sync to global context if it's different
    if (selection.class && (studentData?.grade !== selection.class || studentData?.subject !== selection.subject)) {
       setStudentData(prev => ({
         ...prev,
         grade: selection.class,
         subject: selection.subject
       }));
    }
  }, [selection, studentData, setStudentData]);

  // Standard classes and dynamic subjects
  const availableClasses = CLASSES;
  
  const availableSubjects = useMemo(() => 
    selection.class ? getSubjectsByClass(selection.class) : [], 
    [selection.class]
  );

  const activeUnitData = useMemo(() => {
    if (!selection.class || !selection.subject) return null;
    const activeTopics = quizzes.filter(q => 
      q.class === selection.class && 
      q.subject === selection.subject && 
      q.isActive
    );
    
    if (activeTopics.length === 0) return null;
    
    return {
      unit: activeTopics[0].unit,
      topics: activeTopics,
      topicCount: activeTopics.length,
      class: selection.class,
      subject: selection.subject
    };
  }, [quizzes, selection]);

  const unitProgress = useMemo(() => {
    if (!activeUnitData || !studentData) return 0;
    const topicIds = activeUnitData.topics.map(t => t.id);
    const masteredCount = topicIds.filter(id => 
      attempts.some(a => a.quizId === id && a.rollNo === studentData.rollNo && a.status === 'PASS')
    ).length;
    return Math.round((masteredCount / activeUnitData.topicCount) * 100);
  }, [activeUnitData, attempts, studentData]);

  const studentRank = useMemo(() => {
    if (!selection.class || !selection.subject || !studentData) return null;
    
    const subjectAttempts = attempts.filter(a => 
      a.class === selection.class && 
      a.subject === selection.subject
    );

    const bestPerStudent = {};
    subjectAttempts.forEach(a => {
      const id = a.rollNo || a.studentName;
      if (!bestPerStudent[id] || a.percentage > bestPerStudent[id].percentage) {
        bestPerStudent[id] = a;
      } else if (a.percentage === bestPerStudent[id].percentage && (a.timeTaken || 0) < (bestPerStudent[id].timeTaken || 9999)) {
        bestPerStudent[id] = a;
      }
    });

    const sortedStudents = Object.values(bestPerStudent)
      .sort((a, b) => b.percentage - a.percentage || (a.timeTaken || 0) - (b.timeTaken || 0));

    const rank = sortedStudents.findIndex(s => s.rollNo === studentData.rollNo) + 1;
    return rank > 0 ? rank : null;
  }, [attempts, selection, studentData]);

  const handleAttendUnit = () => {
    if (activeUnitData) {
      setSelectedUnit(activeUnitData);
      setGameState('unit-detail');
    }
  };

  const subjectLeaderboard = useMemo(() => {
    if (!selection.class || !selection.subject) return [];
    
    const subjectAttempts = attempts.filter(a => 
      a.class === selection.class && 
      a.subject === selection.subject
    );

    const bestPerStudent = {};
    subjectAttempts.forEach(a => {
      const name = a.studentName || 'Anonymous';
      if (!bestPerStudent[name] || a.percentage > bestPerStudent[name].percentage) {
        bestPerStudent[name] = a;
      } else if (a.percentage === bestPerStudent[name].percentage && (a.timeTaken || 0) < (bestPerStudent[name].timeTaken || 9999)) {
        bestPerStudent[name] = a;
      }
    });

    return Object.values(bestPerStudent)
      .sort((a, b) => b.percentage - a.percentage || (a.timeTaken || 0) - (b.timeTaken || 0))
      .slice(0, 3);
  }, [attempts, selection]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-premium-gradient">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-premium-gradient">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight text-glow">
          {studentData ? `Welcome, ${studentData.studentName}!` : 'Smart Assessment'}
        </h1>
        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
          {selection.subject 
            ? "You're doing great! Ready to master the next unit and climb the rankings?"
            : 'Select your class and subject to start your personalized learning journey.'}
        </p>
      </motion.div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Selection Card */}
        <GlassCard className="lg:col-span-2 p-8 space-y-8 h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Your Class
              </label>
              <div className="relative">
                <select 
                  value={selection.class}
                  onChange={(e) => setSelection({ class: e.target.value, subject: '' })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-primary-500 transition-colors outline-none cursor-pointer appearance-none font-bold text-lg"
                >
                  <option value="" className="bg-slate-900">Select Grade</option>
                  {CLASSES.map(c => (
                    <option key={c} value={c} className="bg-slate-900">Grade {c}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Select Subject
              </label>
              <div className="relative">
                <select 
                  value={selection.subject}
                  onChange={(e) => setSelection({ ...selection, subject: e.target.value })}
                  disabled={!selection.class}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-primary-500 transition-colors outline-none cursor-pointer appearance-none font-bold text-lg ${
                    !selection.class ? 'opacity-50 cursor-not-allowed text-slate-600' : ''
                  }`}
                >
                  <option value="" className="bg-slate-900">
                    {!selection.class ? 'Select Class First' : 'Select Subject'}
                  </option>
                  {availableSubjects.map(s => {
                    const hasActive = quizzes.some(q => q.class === selection.class && q.subject === s && q.isActive);
                    return (
                      <option key={s} value={s} className="bg-slate-900">
                        {s} {hasActive ? '(Active)' : ''}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selection.subject ? (
              activeUnitData ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 bg-primary-500/20 border border-primary-500/30 rounded-2xl text-primary-400 relative group overflow-hidden">
                      <div className="absolute inset-0 bg-blue-500/10 scale-0 group-hover:scale-150 transition-transform duration-700 rounded-full" />
                      <span className="text-4xl font-black relative">{activeUnitData.topicCount}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 relative">Topics</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-extrabold text-2xl mb-2">{activeUnitData.unit}</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-tighter">
                          <span className="text-primary-400 flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-current" />
                            Unit Progress
                          </span>
                          <span className="text-slate-400">{unitProgress}% Mastered</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${unitProgress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleAttendUnit}
                    className="w-full md:w-auto py-5 px-10 text-lg font-black uppercase tracking-wider animate-pulse-glow"
                  >
                    Launch {activeUnitData.unit} Challenge
                  </Button>
                </motion.div>
                ) : !isFirebaseConfigured ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 text-red-500"
                  >
                    <AlertCircle className="w-8 h-8 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Configuration Missing</p>
                      <p className="text-sm">Database connection not found. Check your environment variables.</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 text-slate-400"
                  >
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="font-bold text-slate-300">No active quiz.</p>
                      <p className="text-sm">Speak with your teacher to activate the unit assessment.</p>
                    </div>
                  </motion.div>
                )
            ) : (
              <div className="h-20" />
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Info / Leaderboard Card */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selection.subject || 'generic'}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                  <Trophy className={`w-6 h-6 ${selection.subject ? 'text-blue-500' : 'text-yellow-400'}`} />
                  {selection.subject ? `${selection.subject} Leaderboard` : 'Recent Performance'}
                </h2>

                {selection.subject ? (
                  subjectLeaderboard.length > 0 ? (
                    <div className="space-y-3">
                      {subjectLeaderboard.map((res, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                              idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                              idx === 1 ? 'bg-slate-300/20 text-slate-300' : 
                              'bg-amber-700/20 text-amber-600'
                            }`}>
                              {idx + 1}
                            </div>
                            <span className="text-sm font-bold text-white line-clamp-1">{res.studentName}</span>
                          </div>
                          <span className="text-sm font-black text-blue-400">{res.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-3">
                      <Zap className="w-10 h-10 text-blue-500/20 mx-auto" strokeWidth={3} />
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Be the first to lead!</p>
                    </div>
                  )
                ) : attempts.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-bold truncate pr-4">{attempts[0].quizTitle}</span>
                      <span className={`font-black tracking-widest text-[10px] px-2 py-1 rounded ${attempts[0].status === 'PASS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {attempts[0].status}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${attempts[0].percentage}%` }}
                        className={`h-full ${attempts[0].status === 'PASS' ? 'bg-emerald-500' : 'bg-red-500'}`}
                      />
                    </div>
                    <div className="flex justify-between font-black text-white text-lg">
                      <span>{attempts[0].percentage}%</span>
                      <span className="text-slate-500 text-sm">{attempts[0].score}/{attempts[0].total}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm italic py-4">No recent attempts recorded.</p>
                )}
              </motion.div>
            </AnimatePresence>
          </GlassCard>

          {/* New Navigation back to Student Entry for testing/updates */}
          <div className="grid grid-cols-1 gap-4">
            <GlassCard 
              className="p-6 cursor-pointer border-primary-500/10 hover:border-primary-500/30 transition-all bg-primary-500/5 group relative overflow-hidden"
              onClick={() => setGameState('leaderboard')}
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-16 h-16 -mr-4 -mt-4 text-white" />
              </div>
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center text-primary-400 group-hover:bg-primary-500/30 transition-all shadow-lg ring-1 ring-white/10">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-base font-black text-white">Class Rankings</p>
                    {studentRank && (
                      <span className="flex items-center gap-1 text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-tighter animate-bounce">
                        <TrendingUp className="w-2.5 h-2.5" />
                        Live
                      </span>
                    )}
                  </div>
                  {studentRank ? (
                    <p className="text-2xl font-black text-primary-400 tracking-tight">
                      Your Rank: <span className="text-white">#{studentRank}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 uppercase tracking-widest font-black">Compare your scores</p>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
