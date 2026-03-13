import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { NotificationProvider, useNotifications } from './react';

describe('Notification React Hook', () => {
  let mockSubscribeCallback: ((state: any) => void) | null = null;
  const mockUnsubscribe = () => {};

  beforeEach(() => {
    mockSubscribeCallback = null;
    delete (window as any).__OGS_APP_BRIDGE__;
  });

  afterEach(() => {
    delete (window as any).__OGS_APP_BRIDGE__;
  });

  it('provides default values when not in OGS app', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotifications(), { wrapper });

    expect(result.current.isInOGSApp).toBe(false);
    expect(result.current.isSupported).toBe(false);
    expect(result.current.deviceId).toBe(null);
  });

  it('reads initial device ID from bridge state', () => {
    (window as any).__OGS_APP_BRIDGE__ = {
      getState: () => ({ ogsDeviceId: 'test-id' }),
      subscribe: () => mockUnsubscribe
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result } = renderHook(() => useNotifications(), { wrapper });

    expect(result.current.isInOGSApp).toBe(true);
    expect(result.current.isSupported).toBe(true);
    expect(result.current.deviceId).toBe('test-id');
  });

  it('updates when device ID changes in bridge state', () => {
    (window as any).__OGS_APP_BRIDGE__ = {
      getState: () => ({ /* initially no id */ }),
      subscribe: (cb: any) => {
        mockSubscribeCallback = cb;
        return mockUnsubscribe;
      }
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NotificationProvider>{children}</NotificationProvider>
    );

    const { result, rerender } = renderHook(() => useNotifications(), { wrapper });

    // Initial state
    expect(result.current.isInOGSApp).toBe(true);
    expect(result.current.isSupported).toBe(false);
    expect(result.current.deviceId).toBe(null);

    // Simulate bridge callback with new ID
    if (mockSubscribeCallback) {
      act(() => {
        mockSubscribeCallback!({ ogsDeviceId: 'new-async-id' });
      });
    }

    rerender();

    expect(result.current.isSupported).toBe(true);
    expect(result.current.deviceId).toBe('new-async-id');
  });
});
