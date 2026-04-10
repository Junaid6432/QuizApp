import React from 'react';
import { motion } from 'framer-motion';
import { Home, Trophy, UserCircle2, LayoutDashboard, LogOut } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';

const MobileTabBar = () => {
  const { gameState, setGameState, role, logout } = useQuiz();

  // Don't show tab bar during actual quiz or if in some modes
  if (['quiz', 'login', 'signup'].includes(gameState)) return null;

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, states: ['home', 'student-entry', 'unit-detail', 'result'] },
    { id: 'leaderboard', label: 'Rankings', icon: Trophy, states: ['leaderboard'] },
    { id: 'profile', label: role === 'teacher' ? 'Admin' : 'Profile', icon: role === 'teacher' ? LayoutDashboard : UserCircle2, states: ['dashboard', 'create-quiz'] },
  ];

  const isActive = (tab) => {
    // If it's the profile tab and we are teacher, check if in dashboard/create-quiz
    if (tab.id === 'profile') {
      return ['dashboard', 'create-quiz'].includes(gameState);
    }
    return tab.states.includes(gameState);
  };

  const handleTabClick = (tabId) => {
    if (tabId === 'home') setGameState('home');
    if (tabId === 'leaderboard') setGameState('leaderboard');
    if (tabId === 'profile') {
      if (role === 'teacher') setGameState('dashboard');
      else setGameState('student-entry');
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2 pointer-events-none">
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="max-w-md mx-auto h-20 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_-20px_40px_rgba(0,0,0,0.5)] flex items-center justify-around px-6 pointer-events-auto ring-1 ring-white/5"
      >
        {tabs.map((tab) => {
          const active = isActive(tab);
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="relative flex flex-col items-center justify-center p-2 group outline-none"
            >
              <div className="relative z-10 transition-transform duration-300 group-active:scale-90">
                <Icon 
                  className={`w-6 h-6 transition-colors duration-300 ${
                    active ? 'text-primary-500' : 'text-slate-500'
                  }`} 
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
              
              <span className={`text-[10px] font-black uppercase tracking-tighter mt-1 transition-colors duration-300 ${
                active ? 'text-white' : 'text-slate-600'
              }`}>
                {tab.label}
              </span>

              {active && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary-500/10 rounded-2xl -z-0"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}

        {role === 'teacher' && (
           <button
             onClick={logout}
             className="flex flex-col items-center justify-center p-2 group outline-none"
           >
             <LogOut className="w-6 h-6 text-red-500/70" />
             <span className="text-[10px] font-black uppercase tracking-tighter mt-1 text-red-500/50">Exit</span>
           </button>
        )}
      </motion.div>
    </div>
  );
};

export default MobileTabBar;
