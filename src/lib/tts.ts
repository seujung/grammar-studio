export interface SpeakOptions {
  accent: 'en-US' | 'en-GB';
  rate: 1 | 0.75;
  onStart?: () => void;
  onEnd?: () => void;
}

export function isTtsSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

export function stopSpeaking(): void {
  if (!isTtsSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore browser speech synthesis cancellation errors
  }
}

export function speakText(text: string, options: SpeakOptions): boolean {
  if (!isTtsSupported() || !text.trim()) {
    options.onEnd?.();
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.accent;
    utterance.rate = options.rate;

    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.lang === options.accent) ??
      voices.find((v) => v.lang.startsWith(options.accent.split('-')[0])) ??
      null;
    if (preferred) {
      utterance.voice = preferred;
    }

    utterance.onstart = () => options.onStart?.();
    utterance.onend = () => options.onEnd?.();
    utterance.onerror = () => options.onEnd?.();

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    options.onEnd?.();
    return false;
  }
}
