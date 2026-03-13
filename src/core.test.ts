import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isOGSWebView, getDeviceId, onDeviceIdChange } from './core';

describe('Notification Kit Core', () => {
  beforeEach(() => {
    // Clear global window properties before each test
    delete (window as any).__OGS_APP_BRIDGE__;
  });

  afterEach(() => {
    delete (window as any).__OGS_APP_BRIDGE__;
  });

  describe('isOGSWebView', () => {
    it('returns false when bridge is not present', () => {
      expect(isOGSWebView()).toBe(false);
    });

    it('returns true when bridge is present', () => {
      (window as any).__OGS_APP_BRIDGE__ = {};
      expect(isOGSWebView()).toBe(true);
    });
  });

  describe('getDeviceId', () => {
    it('returns null when bridge is not present', () => {
      expect(getDeviceId()).toBe(null);
    });

    it('returns null when bridge does not have getState', () => {
      (window as any).__OGS_APP_BRIDGE__ = {};
      expect(getDeviceId()).toBe(null);
    });

    it('returns null when getState returns no device id', () => {
      (window as any).__OGS_APP_BRIDGE__ = {
        getState: () => ({})
      };
      expect(getDeviceId()).toBe(null);
    });

    it('returns device id when present in bridge state', () => {
      (window as any).__OGS_APP_BRIDGE__ = {
        getState: () => ({ ogsDeviceId: 'test-device-id' })
      };
      expect(getDeviceId()).toBe('test-device-id');
    });
  });

  describe('onDeviceIdChange', () => {
    it('returns empty unsubscribe function when bridge has no subscribe method', () => {
      (window as any).__OGS_APP_BRIDGE__ = {};
      const unsubscribe = onDeviceIdChange(() => {});
      expect(typeof unsubscribe).toBe('function');
      expect(() => unsubscribe()).not.toThrow();
    });

    it('subscribes to bridge state changes', () => {
      let subscribeCallback: any;
      const mockUnsubscribe = () => {};
      
      (window as any).__OGS_APP_BRIDGE__ = {
        subscribe: (cb: any) => {
          subscribeCallback = cb;
          return mockUnsubscribe;
        }
      };

      let latestDeviceId = 'initial';
      const unsubscribe = onDeviceIdChange((id) => {
        latestDeviceId = id ?? 'null';
      });

      expect(typeof unsubscribe).toBe('function');
      
      // Simulate state change to a valid ID
      subscribeCallback({ ogsDeviceId: 'new-id' });
      expect(latestDeviceId).toBe('new-id');

      // Simulate state change with no ID
      subscribeCallback({});
      expect(latestDeviceId).toBe('null');
    });
  });
});
