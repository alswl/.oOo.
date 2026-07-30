import { getSavedMousePosition, heartbeatWindow, saveMousePosition } from '../runtime/window-state';

export function saveMousePositionForWindow(window: Window) {
  if (!window) {
    return;
  }
  heartbeatWindow(window);
  const pos = Mouse.location();
  saveMousePosition(window, pos);
}

export function setMousePositionForWindowCenter(window: Window | undefined) {
  if (window === undefined) {
    return;
  }
  const frame = window.frame();
  Mouse.move({
    x: frame.x + frame.width / 2,
    y: frame.y + frame.height / 2,
  });
  heartbeatWindow(window);
}

export function restoreMousePositionForWindow(window: Window | undefined) {
  if (window === undefined) {
    return;
  }
  const pos = getSavedMousePosition(window);
  if (!pos) {
    setMousePositionForWindowCenter(window);
    return;
  }
  const rect = window.frame();
  if (
    pos.x < rect.x ||
    pos.x > rect.x + rect.width ||
    pos.y < rect.y ||
    pos.y > rect.y + rect.height
  ) {
    setMousePositionForWindowCenter(window);
    return;
  }
  // Phoenix.log(String.format('x: {0}, y: {1}', pos.x, pos.y));
  Mouse.move(pos);
  heartbeatWindow(window);
}

export function restoreMousePositionForNow() {
  const window = Window.focused();
  if (window === undefined) {
    return;
  }
  restoreMousePositionForWindow(window);
}
