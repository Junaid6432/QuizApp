import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialTime, onTimeUp, isActive) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef(null);

  const resetTimer = useCallback((newTime) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(newTime || initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isActive || timeLeft === 0) {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, onTimeUp]);

  return { timeLeft, resetTimer };
};
