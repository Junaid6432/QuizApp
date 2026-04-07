import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { ArrowLeft, Lock, Play, CheckCircle2, Bookmark } from 'lucide-react';

const UnitDetail = () => {
  const { 
    selectedUnit, setGameState, 
    quizzes, startQuiz, attempts 
  } = useQuiz();

  if (!selectedUnit) {
    setGameState('home');
    return null;
  }

  // Get all topics for this unit and sort by order
  const unitTopics = quizzes
    .filter(q => 
      q.class === selectedUnit.class && 
      q.subject === selectedUnit.subject && 
      q.unit === selectedUnit.unit &&
      q.isActive
    )
    .sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));

  const isTopicUnlocked = (topic, index) => {
    if (index === 0) return true; // First topic always unlocked
    
    const prevTopic = unitTopics[index - 1];
    return attempts.some(a => a.quizId === prevTopic.id && a.status === 'PASS');
  };

  const getTopicStatus = (topicId) => {
    const attempt = attempts.find(a => a.quizId === topicId);
    if (!attempt) return null;
    return attempt.status; // 'PASS' or 'FAIL'
  };

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setGameState('home')}
          className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-xl"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-primary-400 text-sm font-bold uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" />
            Grade {selectedUnit.class} • {selectedUnit.subject}
          </div>
          <h1 className="text-4xl font-black text-white">{selectedUnit.unit}</h1>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 gap-4">
        {unitTopics.map((topic, index) => {
          const unlocked = isTopicUnlocked(topic, index);
          const status = getTopicStatus(topic.id);
          
          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard 
                className={`p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all border-l-4 ${
                  unlocked 
                    ? status === 'PASS' 
                      ? 'border-l-emerald-500' 
                      : 'border-l-primary-500 bg-primary-500/5'
                    : 'border-l-slate-700 opacity-60'
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    unlocked 
                      ? status === 'PASS' 
                        ? 'bg-emerald-500/20 text-emerald-500' 
                        : 'bg-primary-500/20 text-primary-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {topic.topicName || `Topic ${index + 1}`}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-tighter">
                      <span className="text-slate-400">{topic.questions.length} Questions Pool</span>
                      {status === 'PASS' && (
                        <span className="flex items-center gap-1 text-emerald-500">
                          <CheckCircle2 className="w-3 h-3" />
                          Mastered
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {!unlocked ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 text-slate-500 rounded-xl text-sm font-bold border border-white/5">
                      <Lock className="w-4 h-4" />
                      Locked
                    </div>
                  ) : (
                    <Button 
                      variant={status === 'PASS' ? 'outline' : 'primary'}
                      onClick={() => startQuiz(topic)}
                      className="w-full md:w-auto flex items-center justify-center gap-2 py-3 px-6"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      {status === 'PASS' ? 'Re-take Quiz' : 'Start Topic Quiz'}
                    </Button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
        <p className="text-slate-400 text-sm italic">
          Complete and pass each topic to unlock the next challenge. Master all topics to complete the unit!
        </p>
      </div>
    </div>
  );
};

export default UnitDetail;
