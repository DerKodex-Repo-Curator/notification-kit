// Detects if running inside OGS WebView by checking for app-bridge globals
export function isOGSWebView(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).__OGS_APP_BRIDGE__;
}

// Gets the ogsDeviceId from app-bridge state
export function getDeviceId(): string | null {
  if (!isOGSWebView()) return null;
  const bridge = (window as any).__OGS_APP_BRIDGE__;
  return bridge?.getState?.()?.ogsDeviceId ?? null;
}

// Subscribe to device ID changes (for when bridge initializes async)
export function onDeviceIdChange(callback: (deviceId: string | null) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const bridge = (window as any).__OGS_APP_BRIDGE__;
  if (!bridge?.subscribe) return () => {};
  return bridge.subscribe((state: any) => {
    callback(state?.ogsDeviceId ?? null);
  });
}
