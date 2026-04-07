import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { useTimer } from '../hooks/useTimer';
import GlassCard from '../components/ui/GlassCard';
import CircularProgress from '../components/quiz/CircularProgress';
import MathText from '../components/ui/MathText';
import { ChevronRight, Timer, Brain, ArrowLeft } from 'lucide-react';
import useSound from 'use-sound';

const Quiz = () => {
  const { role, gameState, setGameState, quizzes, currentQuiz, setCurrentQuiz, currentIndex, setCurrentIndex, score, setScore, userAnswers, setUserAnswers, submitAnswer, attempts } = useQuiz();
  const currentQuestion = currentQuiz?.questions?.[currentIndex];
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Sound effects
  const [playCorrect] = useSound('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
  const [playWrong] = useSound('https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3');

  const isTimerEnabled = currentQuiz?.timerEnabled;
  const initialTimeSeconds = isTimerEnabled ? (parseInt(currentQuiz.timeLimit) || 10) * 60 : 999999;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onTimeUp = useCallback(() => {
    if (isTimerEnabled) {
      alert("Time's up! Submitting your answers.");
      // Finalize the quiz immediately
      submitAnswer(selectedOption, 0); 
    }
  }, [isTimerEnabled, selectedOption, submitAnswer]);

  const { timeLeft, resetTimer } = useTimer(initialTimeSeconds, onTimeUp, !showFeedback && isTimerEnabled);

  const handleAnswer = (option) => {
    if (showFeedback || !currentQuestion) return;
    
    setSelectedOption(option);
    setShowFeedback(true);
    
    // We don't use per-question time anymore, so we pass 0 or a dummy value
    const timeTaken = 0; 
    const isCorrect = option === currentQuestion.answer;
    
    if (isCorrect) playCorrect();
    else playWrong();

    setTimeout(() => {
      submitAnswer(option, timeTaken);
      setSelectedOption(null);
      setShowFeedback(false);
    }, 1500);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showFeedback) return;
      if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key) - 1;
        if (currentQuestion?.options[idx]) handleAnswer(currentQuestion.options[idx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, showFeedback, selectedOption]);

  if (!currentQuiz || !currentQuestion) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-premium-gradient overflow-hidden">
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {/* Global Timer Container */}
          {isTimerEnabled && (
            <div className="relative group">
              <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md shadow-xl">
                <Timer className={`w-6 h-6 ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-primary-400'}`} />
                <span className={`text-2xl font-black font-mono ${timeLeft < 30 ? 'text-red-500' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">
              Question {currentIndex + 1} / {currentQuiz.questions.length}
            </span>
            <span className="text-white text-xl font-bold">{currentQuiz.unit}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="glass-panel px-6 py-3 flex items-center gap-3">
            <Timer className="w-5 h-5 text-primary-400" />
            <span className="text-white font-bold text-lg">Score: {score}</span>
          </div>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to exit the quiz? Your progress will be lost.')) {
                setGameState('unit-detail');
              }
            }}
            title="Exit Quiz"
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 transition-all hover:bg-red-500/10 hover:border-red-500/20 shadow-xl backdrop-blur-md"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full max-w-4xl"
        >
          <GlassCard className="p-10 shadow-2xl overflow-hidden relative min-h-[300px]">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary-500/30" />
            
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-tight">
              <MathText text={currentQuestion.question} />
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback}
                  className={`
                    group relative p-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between min-h-[80px]
                    ${showFeedback 
                      ? option === currentQuestion.answer 
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                        : option === selectedOption 
                          ? 'bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/10'
                          : 'bg-white/5 border-white/5 opacity-40'
                      : 'bg-white/5 border-white/10 hover:border-primary-500/50 hover:bg-white/10 text-slate-200'
                    }
                  `}
                >
                  <label className="flex items-center gap-4 cursor-pointer w-full">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-sm font-bold text-primary-400 group-hover:border-primary-500/50 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <MathText text={option} className="text-lg font-medium" />
                  </label>
                  {!showFeedback && (
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary-500" />
                  )}
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex gap-2 flex-wrap justify-center">
        {currentQuiz.questions?.map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === currentIndex ? 'w-8 bg-primary-500' : i < currentIndex ? 'w-4 bg-emerald-500/50' : 'w-4 bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Quiz;
