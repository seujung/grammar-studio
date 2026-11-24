import { toDateKey } from './srs';

export interface FileWritableLike {
  write(data: string): Promise<void>;
  close(): Promise<void>;
}

export interface FileHandleLike {
  name: string;
  getFile(): Promise<{ text(): Promise<string> }>;
  createWritable(): Promise<FileWritableLike>;
  queryPermission?: (descriptor?: { mode?: 'read' | 'readwrite' }) => Promise<string>;
  requestPermission?: (descriptor?: { mode?: 'read' | 'readwrite' }) => Promise<string>;
}

interface PickerWindow {
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    types?: Array<{
      description?: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<FileHandleLike>;
  showOpenFilePicker?: (options?: {
    multiple?: boolean;
    types?: Array<{
      description?: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<FileHandleLike[]>;
}

export function buildProgressFilename(now: Date = new Date()): string {
  return `grammar-progress-${toDateKey(now)}.json`;
}

export function isFileSystemAccessSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as PickerWindow;
  return (
    typeof w.showSaveFilePicker === 'function' &&
    typeof w.showOpenFilePicker === 'function'
  );
}

export type SaveFileResult =
  | {
      ok: true;
      mode: 'direct' | 'download';
      handle: FileHandleLike | null;
      fileName: string;
    }
  | {
      ok: false;
      cancelled: boolean;
      error: string;
    };

export type OpenFileResult =
  | {
      ok: true;
      content: string;
      handle: FileHandleLike;
      fileName: string;
    }
  | {
      ok: false;
      cancelled: boolean;
      error: string;
    };

function isAbortError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name?: string }).name === 'AbortError'
  );
}

async function writeToHandle(handle: FileHandleLike, jsonContent: string): Promise<void> {
  const writable = await handle.createWritable();
  try {
    await writable.write(jsonContent);
  } finally {
    await writable.close();
  }
}

async function ensureWritePermission(handle: FileHandleLike): Promise<boolean> {
  if (typeof handle.queryPermission === 'function') {
    const state = await handle.queryPermission({ mode: 'readwrite' });
    if (state === 'granted') return true;
  }
  if (typeof handle.requestPermission === 'function') {
    const nextState = await handle.requestPermission({ mode: 'readwrite' });
    return nextState === 'granted';
  }
  return true;
}

export async function saveProgressToFile(
  jsonContent: string,
  existingHandle?: FileHandleLike | null,
): Promise<SaveFileResult> {
  if (existingHandle) {
    try {
      const granted = await ensureWritePermission(existingHandle);
      if (!granted) {
        return {
          ok: false,
          cancelled: false,
          error: '파일 쓰기 권한이 거부되었습니다. "다른 파일로 저장"으로 새 파일을 지정해 주십시오.',
        };
      }
      await writeToHandle(existingHandle, jsonContent);
      return {
        ok: true,
        mode: 'direct',
        handle: existingHandle,
        fileName: existingHandle.name,
      };
    } catch (err) {
      if (isAbortError(err)) {
        return { ok: false, cancelled: true, error: '' };
      }
      return {
        ok: false,
        cancelled: false,
        error: '연결된 로컬 파일에 저장하지 못했습니다. 다른 파일로 저장해 보십시오.',
      };
    }
  }

  const w = typeof window !== 'undefined' ? (window as unknown as PickerWindow) : undefined;
  if (w && typeof w.showSaveFilePicker === 'function') {
    try {
      const suggestedName = buildProgressFilename();
      const handle = await w.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: 'Grammar Progress JSON',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      await writeToHandle(handle, jsonContent);
      return {
        ok: true,
        mode: 'direct',
        handle,
        fileName: handle.name || suggestedName,
      };
    } catch (err) {
      if (isAbortError(err)) {
        return { ok: false, cancelled: true, error: '' };
      }
      return {
        ok: false,
        cancelled: false,
        error: '로컬 파일 저장 중 오류가 발생했습니다.',
      };
    }
  }

  // Fallback for Safari/Firefox: trigger standard browser file download
  const fileName = buildProgressFilename();
  try {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    return {
      ok: true,
      mode: 'download',
      handle: null,
      fileName,
    };
  } catch {
    return {
      ok: false,
      cancelled: false,
      error: '파일 다운로드를 시작하지 못했습니다.',
    };
  }
}

export async function openProgressFromPicker(): Promise<OpenFileResult> {
  const w = typeof window !== 'undefined' ? (window as unknown as PickerWindow) : undefined;
  if (!w || typeof w.showOpenFilePicker !== 'function') {
    return {
      ok: false,
      cancelled: false,
      error: '이 브라우저는 직접 파일 열기를 지원하지 않습니다.',
    };
  }

  try {
    const [handle] = await w.showOpenFilePicker({
      multiple: false,
      types: [
        {
          description: 'Grammar Progress JSON',
          accept: { 'application/json': ['.json'] },
        },
      ],
    });
    if (!handle) {
      return { ok: false, cancelled: true, error: '' };
    }
    const file = await handle.getFile();
    const content = await file.text();
    return {
      ok: true,
      content,
      handle,
      fileName: handle.name,
    };
  } catch (err) {
    if (isAbortError(err)) {
      return { ok: false, cancelled: true, error: '' };
    }
    return {
      ok: false,
      cancelled: false,
      error: '선택한 진도 파일을 읽지 못했습니다.',
    };
  }
}
