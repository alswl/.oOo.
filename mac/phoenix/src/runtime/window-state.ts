import { HIDE_INACTIVE_WINDOW_TIME } from '../config';

const mousePositions: Record<number, Point> = {};
const activeWindowTimes: Record<number, number> = {};
const restoreFrames: Record<number, { size: Size; position: Point }> = {};

export function getSavedMousePosition(window: Window): Point | undefined {
  return mousePositions[window.hash()];
}

export function saveMousePosition(window: Window, position: Point): void {
  mousePositions[window.hash()] = position;
}

export function getRestoreFrame(window: Window): { size: Size; position: Point } | undefined {
  return restoreFrames[window.hash()];
}

export function saveRestoreFrame(window: Window): void {
  restoreFrames[window.hash()] = {
    size: window.size(),
    position: window.topLeft(),
  };
}

export function heartbeatWindow(window: Window): void {
  activeWindowTimes[window.app().processIdentifier()] = Date.now() / 1000;
}

export function hideInactiveWindows(windows: Window[]): void {
  const now = Date.now() / 1000;
  windows.forEach((window) => {
    const processIdentifier = window.app().processIdentifier();
    const lastActiveAt = activeWindowTimes[processIdentifier];
    if (lastActiveAt === undefined) {
      activeWindowTimes[processIdentifier] = now;
      return;
    }
    if (now - lastActiveAt > HIDE_INACTIVE_WINDOW_TIME * 60) {
      window.app().hide();
    }
  });
}
