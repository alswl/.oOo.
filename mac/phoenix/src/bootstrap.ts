import { registerHotkeys } from './hotkeys';
import { showTitleModal } from './lib/util';
import { registerWindowStateCleanup } from './runtime/window-state';

export function bootstrap(): void {
  Phoenix.set({
    daemon: true,
    openAtLogin: true,
  });

  registerHotkeys();
  registerWindowStateCleanup();

  const phoenixApp = App.get('Phoenix');
  showTitleModal('Phoenix (re)loaded!', 2, phoenixApp && phoenixApp.icon());
}
