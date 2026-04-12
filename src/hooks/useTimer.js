export const useTimer = (initialTime, onTimeUp, isActive) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep onTimeUp callback fresh
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const resetTimer = useCallback((newTime) => {
    setTimeLeft(newTime !== undefined ? newTime : initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          onTimeUpRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive]); // Only depend on isActive

  return { timeLeft, setTimeLeft, resetTimer };
};
