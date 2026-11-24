import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildProgressFilename,
  isFileSystemAccessSupported,
  openProgressFromPicker,
  saveProgressToFile,
  type FileHandleLike,
} from '../progressFile';

describe('progressFile helpers', () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalWindow) {
      delete (window as unknown as Record<string, unknown>).showSaveFilePicker;
      delete (window as unknown as Record<string, unknown>).showOpenFilePicker;
    }
  });

  it('builds a deterministic dated filename', () => {
    const d = new Date(2026, 10, 24, 14, 20, 0);
    expect(buildProgressFilename(d)).toBe('grammar-progress-2026-11-24.json');
  });

  it('detects File System Access API support', () => {
    expect(isFileSystemAccessSupported()).toBe(false);
    Object.assign(window, {
      showSaveFilePicker: vi.fn(),
      showOpenFilePicker: vi.fn(),
    });
    expect(isFileSystemAccessSupported()).toBe(true);
  });

  it('writes directly to an existing FileHandleLike without prompting picker', async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    const close = vi.fn().mockResolvedValue(undefined);
    const existingHandle: FileHandleLike = {
      name: 'my-grammar.json',
      getFile: vi.fn(),
      createWritable: vi.fn().mockResolvedValue({ write, close }),
    };

    const res = await saveProgressToFile('{"hello":1}', existingHandle);
    expect(res).toEqual({
      ok: true,
      mode: 'direct',
      handle: existingHandle,
      fileName: 'my-grammar.json',
    });
    expect(write).toHaveBeenCalledWith('{"hello":1}');
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('uses showSaveFilePicker when supported and no existing handle is passed', async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    const close = vi.fn().mockResolvedValue(undefined);
    const pickedHandle: FileHandleLike = {
      name: 'picked.json',
      getFile: vi.fn(),
      createWritable: vi.fn().mockResolvedValue({ write, close }),
    };
    Object.assign(window, {
      showSaveFilePicker: vi.fn().mockResolvedValue(pickedHandle),
      showOpenFilePicker: vi.fn(),
    });

    const res = await saveProgressToFile('{"v":1}', null);
    expect(res).toEqual({
      ok: true,
      mode: 'direct',
      handle: pickedHandle,
      fileName: 'picked.json',
    });
  });

  it('falls back to Blob download when File System Access API is unavailable', async () => {
    const click = vi.fn();
    const origCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'a') {
        return { href: '', download: '', click } as unknown as HTMLAnchorElement;
      }
      return origCreateElement(tag);
    }) as typeof document.createElement);
    const createObjectUrl = vi.fn().mockReturnValue('blob:mock');
    const revokeObjectUrl = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectUrl, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectUrl, configurable: true });

    const res = await saveProgressToFile('{"v":1}', null);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.mode).toBe('download');
      expect(res.handle).toBeNull();
    }
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:mock');
    createElementSpy.mockRestore();
  });

  it('handles AbortError cleanly in save and open pickers', async () => {
    const abortErr = new DOMException('User cancelled', 'AbortError');
    Object.assign(window, {
      showSaveFilePicker: vi.fn().mockRejectedValue(abortErr),
      showOpenFilePicker: vi.fn().mockRejectedValue(abortErr),
    });

    const saveRes = await saveProgressToFile('{"v":1}', null);
    expect(saveRes).toEqual({ ok: false, cancelled: true, error: '' });

    const openRes = await openProgressFromPicker();
    expect(openRes).toEqual({ ok: false, cancelled: true, error: '' });
  });

  it('reads text and returns handle from showOpenFilePicker', async () => {
    const pickedHandle: FileHandleLike = {
      name: 'saved.json',
      getFile: vi.fn().mockResolvedValue({ text: vi.fn().mockResolvedValue('{"data":true}') }),
      createWritable: vi.fn(),
    };
    Object.assign(window, {
      showSaveFilePicker: vi.fn(),
      showOpenFilePicker: vi.fn().mockResolvedValue([pickedHandle]),
    });

    const res = await openProgressFromPicker();
    expect(res).toEqual({
      ok: true,
      content: '{"data":true}',
      handle: pickedHandle,
      fileName: 'saved.json',
    });
  });

  it('requests readwrite permission before writing and returns error when denied', async () => {
    const readOnlyHandle: FileHandleLike = {
      name: 'readonly.json',
      getFile: vi.fn(),
      createWritable: vi.fn(),
      queryPermission: vi.fn().mockResolvedValue('prompt'),
      requestPermission: vi.fn().mockResolvedValue('denied'),
    };

    const res = await saveProgressToFile('{"v":1}', readOnlyHandle);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.cancelled).toBe(false);
      expect(res.error).toContain('권한');
    }
    expect(readOnlyHandle.createWritable).not.toHaveBeenCalled();
  });
});
