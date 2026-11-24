import { useState } from 'react';
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
  const supported = isTtsSupported();

  if (!supported) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-slate-400"
        title="이 브라우저는 음성 읽기를 지원하지 않습니다"
      >
        <VolumeX className="h-3.5 w-3.5" />
      </span>
    );
  }

  const handlePlay = (rate: 1 | 0.75) => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    speakText(text, {
      accent: settings.accent,
      rate,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  };

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => handlePlay(settings.speechRate)}
        aria-label={`발음 듣기: ${text}`}
        title={`발음 듣기 (${settings.accent}, ${settings.speechRate}x)`}
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition ${
          speaking
            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/60 dark:text-blue-300'
            : 'border-stone-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-500'
        }`}
      >
        <Volume2 className="h-3.5 w-3.5" />
        {!compact && <span>듣기</span>}
      </button>
      {showSlowOption && (
        <button
          type="button"
          onClick={() => handlePlay(0.75)}
          aria-label={`느리게 듣기: ${text}`}
          title="0.75x 느리게 듣기"
          className="rounded-md border border-stone-200 bg-white px-1.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          0.75x
        </button>
      )}
    </span>
  );
}
