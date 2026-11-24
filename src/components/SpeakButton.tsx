import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isTtsSupported, speakText, stopSpeaking } from '../lib/tts';

interface SpeakButtonProps {
  text: string;
  compact?: boolean;
  showSlowOption?: boolean;
}

export function SpeakButton({
  text,
  compact = false,
  showSlowOption = false,
}: SpeakButtonProps) {
  const { settings } = useApp();
  const [speaking, setSpeaking] = useState(false);
  const speakingRef = useRef(false);
  const activeRateRef = useRef<1 | 0.75>(1);
  const supported = isTtsSupported();

  useEffect(() => {
    return () => {
      if (speakingRef.current) {
        stopSpeaking();
        speakingRef.current = false;
      }
    };
  }, []);

  if (!supported) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-[var(--ink-muted)]"
        title="이 브라우저는 음성 읽기를 지원하지 않습니다"
      >
        <VolumeX className="h-3.5 w-3.5" />
      </span>
    );
  }

  const handlePlay = (rate: 1 | 0.75) => {
    if (speakingRef.current && activeRateRef.current === rate) {
      stopSpeaking();
      speakingRef.current = false;
      setSpeaking(false);
      return;
    }
    activeRateRef.current = rate;
    speakText(text, {
      accent: settings.accent,
      rate,
      onStart: () => {
        speakingRef.current = true;
        setSpeaking(true);
      },
      onEnd: () => {
        speakingRef.current = false;
        setSpeaking(false);
      },
    });
  };

  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={() => handlePlay(settings.speechRate)}
        aria-label={`발음 듣기: ${text}`}
        title={`발음 듣기 (${settings.accent}, ${settings.speechRate}x)`}
        className={`pressable inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${
          speaking
            ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
            : 'interactive-surface interactive-accent-border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-secondary)]'
        }`}
      >
        <Volume2 className={`h-3.5 w-3.5 ${speaking ? 'speaking-pulse' : ''}`} />
        {!compact && <span>듣기</span>}
      </button>
      {showSlowOption && (
        <button
          type="button"
          onClick={() => handlePlay(0.75)}
          aria-label={`느리게 듣기: ${text}`}
          title="0.75x 느리게 듣기"
          className="pressable interactive-surface interactive-accent-border tnum rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-1.5 py-1 text-[11px] font-medium text-[var(--ink-muted)]"
        >
          0.75x
        </button>
      )}
    </span>
  );
}
