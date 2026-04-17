import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { 
  subscribeToQuizzes, 
  addQuizToDb, 
  updateQuizInDb, 
  deleteQuizFromDb, 
  subscribeToAttempts, 
  saveAttemptToDb,
  deleteAttemptFromDb,
  saveStudentProfileToDb,
  getTeacherProfile 
} from '../lib/firestore';

import { 
  onAuthStateChanged,
  signOut 
} from "firebase/auth";
import { auth, isFirebaseConfigured } from '../lib/firebase';

const QuizContext = createContext();

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) throw new Error('useQuiz must be used within a QuizProvider');
  return context;
};

export const QuizProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student'); // 'student' | 'teacher'
  const [gameState, setGameState] = useState(() => {
    // Initial guess from URL, but Auth state will override
    const params = new URLSearchParams(window.location.search);
    const isAdmin = params.get('admin') === 'true';
    if (isAdmin) return 'dashboard';
    return 'student-entry';
  }); 

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [emisCode, setEmisCode] = useState(() => localStorage.getItem('emisCode') || 'GPSK001');

  // Firebase Auth Listener
  useEffect(() => {
    if (!auth) {
      console.warn("Auth not initialized, bypassing loading state");
      setIsLoadingAuth(false);
      return;
    }

    // Safety timeout: If Auth doesn't resolve in 5 seconds, proceed anyway
    const safetyTimer = setTimeout(() => {
      if (isLoadingAuth) {
        console.warn("Auth initialization timed out, proceeding to student view");
        setIsLoadingAuth(false);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth State Changed:", firebaseUser ? "Teacher Logged In" : "Student View");
      setUser(firebaseUser);
      
      try {
        if (firebaseUser) {
          setRole('teacher');
          // Fetch profile details (especially EMIS Code)
          try {
            const profile = await getTeacherProfile(firebaseUser.uid);
            if (profile) {
              setTeacherProfile(profile);
              if (profile.emisCode) {
                setEmisCode(profile.emisCode);
                localStorage.setItem('emisCode', profile.emisCode);
              }
            }
          } catch (e) {
            console.error("Error loading teacher profile", e);
          }
        } else {
          setRole('student');
          setTeacherProfile(null);
          
          // Check URL for direct access to teacher/login
          const params = new URLSearchParams(window.location.search);
          const mode = params.get('mode')?.toLowerCase();
          const isAdmin = params.get('admin')?.toLowerCase() === 'true';
          if (mode === 'teacher' || isAdmin) {
            setGameState('login');
          }
        }

        // Automatic Redirection logic
        setGameState(prev => {
          const params = new URLSearchParams(window.location.search);
          const mode = params.get('mode')?.toLowerCase();
          const isAdmin = params.get('admin')?.toLowerCase() === 'true';

          if (firebaseUser && (prev === 'login' || prev === 'signup' || mode === 'teacher' || isAdmin)) {
            return 'dashboard';
          }
          return prev;
        });
      } catch (err) {
        console.error("Critical error in Auth Listener callback:", err);
      } finally {
        setIsLoadingAuth(false);
        clearTimeout(safetyTimer);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setGameState('student-entry');
    } catch (error) {
      console.error("Logout error", error);
    }
  }, []);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [studentData, setStudentData] = useState(() => {
    try {
      const saved = localStorage.getItem('studentData');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing studentData", e);
      return null;
    }
  });

  // Persistence

  // --- Data States (Synced with Firebase) ---
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time Subscriptions
  useEffect(() => {
    const unsubscribeQuizzes = subscribeToQuizzes((data, error) => {
      if (error) {
        console.error("Quiz subscription error", error);
      }
      // Manual sort as a workaround for missing Firestore indexes
      const sorted = [...data].sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));
      setQuizzes(sorted);
      setIsLoading(false);
    }, emisCode);

    const unsubscribeAttempts = subscribeToAttempts((data, error) => {
      if (error) {
        console.error("Attempts subscription error", error);
      }
      // Sort by timestamp desc
      const sorted = [...data].sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      setAttempts(sorted);
    }, emisCode);

    return () => {
      unsubscribeQuizzes();
      unsubscribeAttempts();
    };
  }, [emisCode]);


  // Toggle Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync student metadata to localStorage


  useEffect(() => {
    if (studentData) {
      localStorage.setItem('studentData', JSON.stringify(studentData));
      // Also sync to Firestore
      saveStudentProfileToDb({
        ...studentData,
        emisCode,
        lastActive: new Date().toISOString()
      });
    }
  }, [studentData, emisCode]);


  const [editQuizId, setEditQuizId] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Teacher Actions
  const addQuiz = useCallback(async (newQuiz) => {
    await addQuizToDb({ 
      ...newQuiz, 
      emisCode, // Critical: Ensure multi-tenant isolation
      topicName: newQuiz.topicName || 'General Assessment',
      order: parseInt(newQuiz.order) || 1,
      isActive: false
    });
  }, [emisCode]);

  const updateQuiz = useCallback(async (id, updatedData) => {
    await updateQuizInDb(id, { 
      ...updatedData,
      emisCode, // Maintain isolation on update
      order: parseInt(updatedData.order) || 1 
    });
  }, [emisCode]);

  const deleteQuiz = useCallback(async (id) => {
    await deleteQuizFromDb(id);
  }, []);

  const renameUnit = useCallback(async (oldName, newName, className, subjectName) => {
    const quizzesToUpdate = quizzes.filter(q => 
      q.unit === oldName && 
      q.class === className && 
      q.subject === subjectName
    );
    
    for (const quiz of quizzesToUpdate) {
      await updateQuizInDb(quiz.id, { unit: newName });
    }
  }, [quizzes]);

  const deleteResults = useCallback(async (ids) => {
    for (const id of ids) {
      await deleteAttemptFromDb(id);
    }
  }, []);

  const toggleQuizActive = useCallback(async (id) => {
    const target = quizzes.find(q => q.id === id);
    if (!target) return;

    const newState = !target.isActive;

    // Business Logic: If activating, deactivate other units of same class/subject
    if (newState) {
      const othersToDeactivate = quizzes.filter(q => 
        q.id !== id && 
        q.class === target.class && 
        q.subject === target.subject && 
        q.unit !== target.unit &&
        q.isActive === true
      );

      for (const quiz of othersToDeactivate) {
        await updateQuizInDb(quiz.id, { isActive: false });
      }
    }

    await updateQuizInDb(id, { isActive: newState });
  }, [quizzes]);

  const updateProfile = useCallback(async (updatedData) => {
    if (!user) return;
    try {
      await saveTeacherProfileToDb(user.uid, updatedData);
      setTeacherProfile(prev => ({ ...prev, ...updatedData }));
      if (updatedData.emisCode) {
        setEmisCode(updatedData.emisCode);
        localStorage.setItem('emisCode', updatedData.emisCode);
      }
    } catch (error) {
      console.error("Error updating profile", error);
      throw error;
    }
  }, [user]);


  // Student Actions
  const startQuiz = useCallback((quiz) => {
    if (!quiz || !quiz.questions) return;
    
    // Robust shuffle (Fisher-Yates) and slice
    const fullPool = [...quiz.questions];
    for (let i = fullPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fullPool[i], fullPool[j]] = [fullPool[j], fullPool[i]];
    }
    
    const limit = quiz.questionLimit ? parseInt(quiz.questionLimit) : fullPool.length;
    const selectedQuestions = fullPool.slice(0, Math.min(limit, fullPool.length));

    setCurrentQuiz({ ...quiz, questions: selectedQuestions });
    setCurrentIndex(0);
    setScore(0);
    setUserAnswers([]);
    setGameState('quiz');
  }, []);

  const submitAnswer = useCallback((answer, timeTaken) => {
    if (!currentQuiz?.questions) return;
    
    const isCorrect = currentQuiz.questions[currentIndex]?.answer === answer;
    const newScore = isCorrect ? score + 1 : score;
    
    if (isCorrect) setScore((s) => s + 1);
    
    setUserAnswers((prev) => [...prev, { 
      questionIndex: currentIndex, 
      answer, 
      isCorrect,
      timeTaken 
    }]);
    
    if (currentIndex + 1 < currentQuiz.questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setGameState('result');
      const total = currentQuiz.questions.length;
      const percentage = Math.round((newScore / Math.max(1, total)) * 100);
      
      // Update student metadata context to remember the last taken subject/grade
      if (studentData) {
        setStudentData(prev => ({
          ...prev,
          grade: currentQuiz.class,
          subject: currentQuiz.subject
        }));
      }

      // Calculate total time taken
      const totalTime = [...userAnswers, { timeTaken }].reduce((acc, curr) => acc + (curr.timeTaken || 0), 0);
      
      const newAttempt = {
        emisCode,
        quizId: currentQuiz.id,
        quizTitle: `${currentQuiz.class} - ${currentQuiz.subject} (${currentQuiz.unit}: ${currentQuiz.topicName || 'General Assessment'})`,
        class: currentQuiz.class,
        subject: currentQuiz.subject,
        unit: currentQuiz.unit,
        topicName: currentQuiz.topicName || 'General Assessment',
        studentName: studentData?.studentName || 'Anonymous',
        rollNo: studentData?.rollNo || 'N/A',
        score: newScore,
        total,
        percentage,
        timeTaken: totalTime,
        status: percentage >= 50 ? 'PASS' : 'FAIL'
      };
      
      saveAttemptToDb(newAttempt);
    }

  }, [currentQuiz, currentIndex, score, userAnswers, studentData]);


  const restart = useCallback(() => {
    if (currentQuiz) {
      const fullQuiz = quizzes.find(q => q.id === currentQuiz.id);
      if (fullQuiz) startQuiz(fullQuiz);
    }
  }, [currentQuiz, quizzes, startQuiz]);

  const value = useMemo(() => ({
    role, setRole,
    user, logout, isLoadingAuth, emisCode, setEmisCode, isFirebaseConfigured,
    gameState, setGameState,
    isLoading,
    quizzes, addQuiz, updateQuiz, deleteQuiz, toggleQuizActive, renameUnit,
    attempts, deleteResults,
    teacherProfile, updateProfile,
    editQuizId, setEditQuizId,
    selectedUnit, setSelectedUnit,
    studentData, setStudentData,
    attempts,
    currentQuiz, startQuiz,
    currentIndex, score, userAnswers,
    isDarkMode, setIsDarkMode,
    submitAnswer, restart
  }), [role, gameState, isLoading, quizzes, addQuiz, updateQuiz, deleteQuiz, toggleQuizActive, editQuizId, selectedUnit, studentData, attempts, currentQuiz, startQuiz, currentIndex, score, userAnswers, isDarkMode, submitAnswer, restart, isFirebaseConfigured, emisCode]);



  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};
