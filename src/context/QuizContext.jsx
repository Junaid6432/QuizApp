import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const QuizContext = createContext();

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) throw new Error('useQuiz must be used within a QuizProvider');
  return context;
};

export const QuizProvider = ({ children }) => {
  const [role, setRole] = useState('student'); // 'student' | 'teacher'
  const [gameState, setGameState] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const isAdmin = params.get('admin') === 'true';
    const isTeacher = params.get('mode')?.toLowerCase() === 'teacher';
    
    if (isAdmin || isTeacher) return 'dashboard';
    
    // Always start at student-entry for students
    return 'student-entry';
  }); 


  // URL-based role switching
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode')?.toLowerCase();
    const isAdmin = params.get('admin')?.toLowerCase() === 'true';

    if (mode === 'teacher' || isAdmin) {
      setRole('teacher');
      setGameState('dashboard');
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

  const [quizzes, setQuizzes] = useState(() => {
    const saved = localStorage.getItem('quizzes');
    return saved ? JSON.parse(saved) : [];
  });

  const [attempts, setAttempts] = useState(() => {
    const saved = localStorage.getItem('quiz_attempts');
    return saved ? JSON.parse(saved) : [];
  });

  // Toggle Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('quiz_attempts', JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    if (studentData) {
      localStorage.setItem('studentData', JSON.stringify(studentData));
    }
  }, [studentData]);


  const [editQuizId, setEditQuizId] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Teacher Actions
  const addQuiz = useCallback((newQuiz) => {
    setQuizzes((prev) => [...prev, { 
      ...newQuiz, 
      id: Date.now().toString(), 
      createdAt: new Date().toISOString(),
      topicName: newQuiz.topicName || 'General Assessment',
      order: parseInt(newQuiz.order) || 1
    }]);
  }, []);

  const updateQuiz = useCallback((id, updatedData) => {
    setQuizzes((prev) => prev.map(q => q.id === id ? { 
      ...q, 
      ...updatedData,
      order: parseInt(updatedData.order) || q.order || 1 
    } : q));
  }, []);

  const deleteQuiz = useCallback((id) => {
    setQuizzes((prev) => prev.filter(q => q.id !== id));
  }, []);

  const toggleQuizActive = useCallback((id) => {
    setQuizzes((prev) => {
      const target = prev.find(q => q.id === id);
      if (!target) return prev;

      const newState = !target.isActive;

      return prev.map(q => {
        // If activating, deactivate all topics of DIFFERENT units for the same class+subject
        if (newState && q.class === target.class && q.subject === target.subject && q.unit !== target.unit) {
          return { ...q, isActive: false };
        }
        if (q.id === id) return { ...q, isActive: newState };
        return q;
      });
    });
  }, []);

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
        id: Date.now().toString(),
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
        status: percentage >= 50 ? 'PASS' : 'FAIL',
        timestamp: new Date().toISOString()
      };
      setAttempts((prev) => [newAttempt, ...prev]);
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
    gameState, setGameState,
    quizzes, addQuiz, updateQuiz, deleteQuiz, toggleQuizActive,
    editQuizId, setEditQuizId,
    selectedUnit, setSelectedUnit,
    studentData, setStudentData,
    attempts,
    currentQuiz, startQuiz,
    currentIndex, score, userAnswers,
    isDarkMode, setIsDarkMode,
    submitAnswer, restart
  }), [role, gameState, quizzes, addQuiz, updateQuiz, deleteQuiz, toggleQuizActive, editQuizId, selectedUnit, studentData, attempts, currentQuiz, startQuiz, currentIndex, score, userAnswers, isDarkMode, submitAnswer, restart]);


  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};
