/**
 * Browser TTS for read-aloud. Uses speechSynthesis.
 */

let synth: SpeechSynthesis | null = null;

function getSynth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  if (!synth) synth = window.speechSynthesis;
  return synth;
}

export function speak(text: string, onEnd?: () => void): void {
  const s = getSynth();
  if (!s || !text?.trim()) return;

  s.cancel();

  const u = new SpeechSynthesisUtterance(text.trim());
  u.rate = 0.95;
  u.pitch = 1;
  if (onEnd) {
    u.onend = onEnd;
    u.onerror = onEnd;
  }

  s.speak(u);
}

export function stop(): void {
  getSynth()?.cancel();
}

export function isSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
