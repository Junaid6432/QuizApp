import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import confetti from 'canvas-confetti';
import { Award, RefreshCcw, LayoutDashboard, XCircle, CheckCircle2, Trophy, Clock, Star, ArrowLeft } from 'lucide-react';

const Result = () => {
  const { score, currentQuiz, restart, setGameState, userAnswers, attempts, studentData, selectedUnit } = useQuiz();
  const total = currentQuiz?.questions.length || 0;
  const percentage = Math.round((score / total) * 100);
  const isPassed = percentage >= 50;
  const [animatedScore, setAnimatedScore] = useState(0);

  // Logic for Smart Back Button
  const currentIndex = useMemo(() => {
    if (!selectedUnit || !currentQuiz) return -1;
    return selectedUnit.topics.findIndex(t => t.id === currentQuiz.id);
  }, [selectedUnit, currentQuiz]);

  const hasNextTopic = currentIndex !== -1 && currentIndex < (selectedUnit?.topics?.length - 1);

  const averageTime = userAnswers.length > 0
    ? (userAnswers.reduce((acc, curr) => acc + (curr.timeTaken || 0), 0) / userAnswers.length).toFixed(1)
    : 0;

  useEffect(() => {
    if (isPassed) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });
    }

    const duration = 2000;
    const increment = percentage / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= percentage) {
        setAnimatedScore(percentage);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [percentage, isPassed]);

  // Ranking & Leaderboard Logic
  const subjectRankings = useMemo(() => {
    if (!currentQuiz || attempts.length === 0) return [];

    // Filter attempts for this specific quiz/topic
    const filtered = attempts.filter(a => 
      a.class === currentQuiz.class && 
      a.subject === currentQuiz.subject &&
      a.unit === currentQuiz.unit &&
      a.topicName === (currentQuiz.topicName || 'General Assessment')
    );

    // Group by student rollNo and get BEST result
    const bestPerStudent = {};
    filtered.forEach(a => {
      const id = a.rollNo || a.studentName;
      if (!bestPerStudent[id] || a.percentage > bestPerStudent[id].percentage) {
        bestPerStudent[id] = a;
      } else if (a.percentage === bestPerStudent[id].percentage && (a.timeTaken || 0) < (bestPerStudent[id].timeTaken || 9999)) {
        bestPerStudent[id] = a;
      }
    });

    return Object.values(bestPerStudent).sort((a, b) => 
      b.percentage - a.percentage || (a.timeTaken || 0) - (b.timeTaken || 0)
    );
  }, [attempts, currentQuiz]);

  const userRank = useMemo(() => {
    const index = subjectRankings.findIndex(r => r.rollNo === studentData?.rollNo);
    return index !== -1 ? index + 1 : null;
  }, [subjectRankings, studentData]);

  const top3 = subjectRankings.slice(0, 3);
  const isUserInTop3 = userRank && userRank <= 3;
  const userEntry = userRank ? subjectRankings[userRank - 1] : null;

  const formatTime = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center py-12 px-6 bg-premium-gradient overflow-y-auto">
      <div className="w-full max-w-2xl space-y-8">
        {/* Score Card */}
        <GlassCard className={`text-center relative overflow-hidden border-t-8 shadow-2xl ${
          isPassed ? 'border-emerald-500 shadow-emerald-500/10' : 'border-red-500 shadow-red-500/10'
        }`}>
          {/* Background Gradients */}
          <div className={`absolute top-0 right-0 w-48 h-48 rounded-full -mr-24 -mt-24 blur-3xl opacity-20 ${
            isPassed ? 'bg-emerald-500' : 'bg-red-500'
          }`} />
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="mb-8"
          >
            {isPassed ? (
              <CheckCircle2 className="w-24 h-24 mx-auto text-emerald-500" />
            ) : (
              <XCircle className="w-24 h-24 mx-auto text-red-500" />
            )}
          </motion.div>

          <h2 className={`text-sm font-black uppercase tracking-[0.2em] mb-2 ${
            isPassed ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {isPassed ? 'Assessment Passed' : 'Assessment Failed'}
          </h2>
          
          <h1 className="text-4xl font-extrabold text-white mb-8">
            {isPassed ? 'Outstanding! 🎓' : 'Keep Practicing! 💪'}
          </h1>

          <div className="flex justify-center items-baseline gap-2 mb-10">
            <motion.span 
              className={`text-9xl font-black text-transparent bg-clip-text ${
                isPassed ? 'bg-gradient-to-br from-emerald-400 to-primary-500' : 'bg-gradient-to-br from-red-400 to-amber-600'
              }`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {animatedScore}
            </motion.span>
            <span className="text-4xl font-bold text-slate-500">%</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10 text-left">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <span className="block text-slate-500 text-[10px] mb-1 uppercase font-black tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" />
                Correct Answers
              </span>
              <span className="text-2xl font-bold text-white">{score} / {total}</span>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <span className="block text-slate-500 text-[10px] mb-1 uppercase font-black tracking-widest flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Avg Response
              </span>
              <span className="text-2xl font-bold text-white">{averageTime}s</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 p-4 w-full">
            <Button 
              variant="outline" 
              onClick={() => setGameState(hasNextTopic ? 'unit-detail' : 'home')} 
              className="flex-1 flex items-center gap-2 justify-center py-4 px-6 border-white/10 hover:border-white/20 leading-none order-1 sm:order-1"
            >
              <ArrowLeft className="w-5 h-5" />
              {hasNextTopic ? 'Back to Unit' : 'Finish & Home'}
            </Button>

            <Button onClick={restart} className="flex-1 flex items-center gap-2 justify-center py-4 px-6 shadow-xl leading-none order-2 sm:order-2">
              <RefreshCcw className="w-5 h-5" />
              Reattempt
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setGameState('leaderboard')} 
              className="flex-1 flex items-center gap-2 justify-center py-4 px-6 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10 leading-none group order-3 sm:order-3"
            >
              <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Class Rank
            </Button>
          </div>
        </GlassCard>

        {/* Leaderboard Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <GlassCard className="p-6 border-white/5 hover:border-white/10 transition-colors">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Our Champions
              <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400 uppercase tracking-widest ml-auto">
                {currentQuiz?.topicName} Rankings
              </span>
            </h3>

            {subjectRankings.length > 0 ? (
              <div className="space-y-3">
                {top3.map((entry, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      entry.rollNo === studentData?.rollNo 
                        ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                        : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                        idx === 0 ? 'bg-yellow-500/30 text-yellow-500' : 
                        idx === 1 ? 'bg-slate-300/30 text-slate-300' : 
                        'bg-amber-700/30 text-amber-600'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{entry.studentName}</span>
                          {entry.rollNo === studentData?.rollNo && (
                            <span className="text-[8px] bg-blue-500 px-1.5 py-0.5 rounded text-white font-black uppercase tracking-tighter">YOUR POSITION</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">Roll No: {entry.rollNo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-white">{entry.percentage}%</span>
                      <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{formatTime(entry.timeTaken)}s</p>
                    </div>
                  </div>
                ))}

                {/* Gap Indicator */}
                {!isUserInTop3 && userRank && userRank > 4 && (
                  <div className="flex justify-center py-1 opacity-20">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-white rounded-full" />)}
                    </div>
                  </div>
                )}

                {/* Personal Rank (if outside Top 3) */}
                {!isUserInTop3 && userEntry && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-blue-600/20 border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-6 relative"
                  >
                    <div className="absolute top-0 right-10 -translate-y-1/2">
                       <Star className="w-4 h-4 text-blue-400 fill-blue-400" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs bg-blue-500 text-white">
                        {userRank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{userEntry.studentName}</span>
                          <span className="text-[8px] bg-blue-500 px-1.5 py-0.5 rounded text-white font-black uppercase tracking-tighter">YOUR POSITION</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium tracking-wide">Roll No: {userEntry.rollNo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-blue-400">{userEntry.percentage}%</span>
                      <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{formatTime(userEntry.timeTaken)}s</p>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <RefreshCcw className="w-10 h-10 mx-auto mb-4 opacity-10 animate-spin-slow" />
                <p className="text-sm font-bold uppercase tracking-widest opacity-50">Complete the quiz to see your standing!</p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Result;
