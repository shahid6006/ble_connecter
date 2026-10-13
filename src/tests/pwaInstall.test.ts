import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePWAInstall } from '../hooks/usePWAInstall';

describe('usePWAInstall hook', () => {
  it('initializes with installable false when beforeinstallprompt has not fired', () => {
    const { result } = renderHook(() => usePWAInstall());
    expect(result.current.isInstallable).toBe(false);
  });

  it('captures beforeinstallprompt and enables isInstallable', () => {
    const { result } = renderHook(() => usePWAInstall());

    const mockEvent = new Event('beforeinstallprompt');
    (mockEvent as any).prompt = vi.fn().mockResolvedValue(undefined);
    (mockEvent as any).userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });

    act(() => {
      window.dispatchEvent(mockEvent);
    });

    expect(result.current.isInstallable).toBe(true);
  });
});
