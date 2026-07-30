import { HIDE_INACTIVE_WINDOW_TIME } from '../config';

const mousePositions = new Map<number, Point>();
const activeWindowTimes = new Map<number, number>();
const restoreFrames = new Map<number, { size: Size; position: Point }>();

export function getSavedMousePosition(window: Window): Point | undefined {
  return mousePositions.get(window.hash());
}

export function saveMousePosition(window: Window, position: Point): void {
  mousePositions.set(window.hash(), position);
}

export function getRestoreFrame(window: Window): { size: Size; position: Point } | undefined {
  return restoreFrames.get(window.hash());
}

export function clearRestoreFrame(window: Window): void {
  restoreFrames.delete(window.hash());
}

export function saveRestoreFrame(window: Window): void {
  restoreFrames.set(window.hash(), {
    size: window.size(),
    position: window.topLeft(),
  });
}

export function heartbeatWindow(window: Window): void {
  activeWindowTimes.set(window.app().processIdentifier(), Date.now() / 1000);
}

export function registerWindowStateCleanup(): void {
  Event.on('windowDidClose', (window) => {
    const windowHash = window.hash();
    mousePositions.delete(windowHash);
    restoreFrames.delete(windowHash);
  });
  Event.on('appDidTerminate', (app) => {
    activeWindowTimes.delete(app.processIdentifier());
  });
}

export function hideInactiveWindows(windows: Window[]): void {
  const now = Date.now() / 1000;
  windows.forEach((window) => {
    const processIdentifier = window.app().processIdentifier();
    const lastActiveAt = activeWindowTimes.get(processIdentifier);
    if (lastActiveAt === undefined) {
      activeWindowTimes.set(processIdentifier, now);
      return;
    }
    if (now - lastActiveAt > HIDE_INACTIVE_WINDOW_TIME * 60) {
      window.app().hide();
    }
  });
}
