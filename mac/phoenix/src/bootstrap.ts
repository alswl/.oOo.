import { registerHotkeys } from './hotkeys';
import { showTitleModal } from './lib/util';

export function bootstrap(): void {
  Phoenix.set({
    daemon: true,
    openAtLogin: true,
  });

  registerHotkeys();

  const phoenixApp = App.get('Phoenix');
  showTitleModal('Phoenix (re)loaded!', 2, phoenixApp && phoenixApp.icon());
}
