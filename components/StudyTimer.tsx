"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const WORK_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function StudyTimer() {
  const [secondsLeft, setSecondsLeft] = useState(WORK_SEC);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const isBreakRef = useRef(isBreak);
  isBreakRef.current = isBreak;

  const total = isBreak ? BREAK_SEC : WORK_SEC;

  const reset = useCallback((toBreak?: boolean) => {
    setIsRunning(false);
    const next = toBreak ?? isBreak;
    setIsBreak(next);
    setSecondsLeft(next ? BREAK_SEC : WORK_SEC);
  }, [isBreak]);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setIsRunning(false);
          const nextBreak = !isBreakRef.current;
          setIsBreak(nextBreak);
          return nextBreak ? BREAK_SEC : WORK_SEC;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isRunning, secondsLeft]);

  const toggle = () => {
    if (secondsLeft <= 0) reset();
    setIsRunning((r) => !r);
  };

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-sm font-medium text-[var(--foreground)]">
          {isBreak ? "Break" : "Focus"}
        </span>
        <span className="text-lg tabular-nums text-[var(--foreground)]">
          {formatTime(secondsLeft)}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={toggle}
          className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={() => reset(isBreak)}
          className="px-3 py-1.5 rounded-lg border border-[var(--card-border)] text-sm text-[var(--foreground)] hover:bg-white/5"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
