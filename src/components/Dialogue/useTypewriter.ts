import { useEffect, useRef, useState } from 'react';

export interface TypewriterState {
  text: string;
  done: boolean;
  finish: () => void;
  restart: (next: string) => void;
}

export function useTypewriter(fullText: string, speedMs = 22): TypewriterState {
  const [text, setText] = useState('');
  const indexRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setText('');
    setDone(false);
    indexRef.current = 0;
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
    }
    if (!fullText) {
      setDone(true);
      return;
    }
    timerRef.current = window.setInterval(() => {
      indexRef.current += 1;
      setText(fullText.slice(0, indexRef.current));
      if (indexRef.current >= fullText.length) {
        if (timerRef.current !== null) window.clearInterval(timerRef.current);
        timerRef.current = null;
        setDone(true);
      }
    }, speedMs);
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, [fullText, speedMs]);

  const finish = () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setText(fullText);
    setDone(true);
  };

  const restart = (_next: string) => {
    setText('');
    setDone(false);
  };

  return { text, done, finish, restart };
}
