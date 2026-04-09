import React, { Suspense, lazy } from 'react';
import { QuizProvider, useQuiz } from './context/QuizContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, GraduationCap, Users, Settings, UserCircle, LogOut } from 'lucide-react';


// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'));
const UnitDetail = lazy(() => import('./pages/UnitDetail'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Result = lazy(() => import('./pages/Result'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const QuizCreator = lazy(() => import('./pages/QuizCreator'));
const StudentEntry = lazy(() => import('./pages/StudentEntry'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));



const Layout = () => {
  const { role, gameState, setGameState, isDarkMode, setIsDarkMode, isLoadingAuth, logout } = useQuiz();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-premium-gradient flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full" 
        />
      </div>
    );
  }

  const renderContent = () => {
    if (gameState === 'login') return <Login />;
    if (gameState === 'signup') return <Signup />;
    
    // Protected Routes
    if (['dashboard', 'create-quiz'].includes(gameState) && role !== 'teacher') {
       return <Login />;
    }

    if (gameState === 'quiz') return <Quiz />;
    if (gameState === 'result') return <Result />;
    if (gameState === 'unit-detail') return <UnitDetail />;
    if (gameState === 'create-quiz') return <QuizCreator />;
    if (gameState === 'dashboard') return <TeacherDashboard />;
    
    if (gameState === 'student-entry') return <StudentEntry />;
    if (gameState === 'leaderboard') return <Leaderboard />;
    
    return <Home />;
  };



  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-premium-gradient">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header / Nav */}
      <header className={`p-4 flex justify-between items-center z-10 border-b border-white/5 transition-all duration-500 ${
        gameState === 'student-entry' ? 'bg-transparent border-none py-2' : 'bg-black/5 backdrop-blur-md'
      }`}>
        {gameState !== 'student-entry' ? (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setGameState('home')}>
            <div className="w-10 h-10 bg-accent-gradient rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg">Q</div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-xl tracking-tight block leading-none">GPS Kunda</span>
              <span className="text-primary-400 text-[10px] font-black uppercase tracking-[0.2em]">Smart Portal</span>
            </div>
          </div>
        ) : <div />}

        <div className="flex items-center gap-4">
          {/* Dashboard shortcut for teachers when in student view */}
          {role === 'teacher' && gameState === 'home' && (
            <button 
              onClick={() => setGameState('dashboard')}
              className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-emerald-400 text-[10px] font-black tracking-widest hover:bg-emerald-500/20 transition-all"
            >
              <Users className="w-4 h-4" />
              ADMIN DASHBOARD
            </button>
          )}

          {role === 'teacher' ? (
             <button 
               onClick={logout}
               title="Logout"
               className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all shadow-xl backdrop-blur-md"
             >
                <LogOut className="w-5 h-5" />
             </button>
          ) : (
            <>
              {gameState === 'student-entry' && (
                <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all shadow-xl backdrop-blur-md">
                  <Settings className="w-5 h-5" />
                </button>
              )}

              <button 
                onClick={() => setGameState('student-entry')}
                title="Update Profile"
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-xl backdrop-blur-md"
              >
                <UserCircle className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content with Page Transitions */}
      <main className="flex-1 flex flex-col relative z-20">
        <AnimatePresence mode="wait">
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full" 
              />
            </div>
          }>
            <motion.div
              key={`${role}-${gameState}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              {renderContent()}
            </motion.div>
          </Suspense>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-slate-600 text-xs z-10 border-t border-white/5 bg-black/20 backdrop-blur-lg">
        &copy; 2026 Educational Digital Hub - Powered by GPS No. 4 Kunda Core
      </footer>
    </div>
  );
};

function App() {
  return (
    <QuizProvider>
      <Layout />
    </QuizProvider>
  );
}

export default App;
