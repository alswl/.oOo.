import { MASH_CTRL, MASH_CTRL_SHIFT } from './constants';

// App launch bindings (all under MASH_CTRL). Add an app = add a row.
// Commented rows are kept intentionally as a quick swap-menu of alternatives.
interface AppBinding {
  key: string;
  app: string;
  fallback?: string;
}
const APP_LAUNCH: AppBinding[] = [
  // Key.on('`', MASH_CTRL, () => callApp('iTerm'));
  { key: '`', app: 'kitty' },
  { key: 'escape', app: 'kitty' },
  // { key: '1', app: 'Chromium' },
  // { key: '1', app: 'Firefox' },
  // { key: '1', app: 'Microsoft Edge' },
  // { key: '1', app: 'Vivaldi' },
  { key: '1', app: 'Google Chrome' },
  // { key: '1', app: 'Google Chrome Beta' },
  // { key: '2', app: 'Firefox' },
  { key: '2', app: 'Min' },
  // { key: '2', app: 'Safari' },
  // { key: '2', app: 'Brave Browser' },
  // { key: '2', app: 'electron-terminal' },
  // { key: '2', app: 'Chromium' },
  // iDingTalk = 阿里钉
  { key: '3', app: 'Antding', fallback: 'Wechat' },
  // { key: '3', app: 'DingTalk Lite' },
  // { key: '4', app: 'BearyChat' },
  // { key: '4', app: 'Wechat', fallback: 'Electronic WeChat' },
  { key: '4', app: '微信网页版' },
  { key: '6', app: 'ChatWise' },
  { key: '7', app: 'Ghostty' },
  { key: '8', app: 'Music' },
  { key: '9', app: 'NeteaseMusic' },
  // { key: '9', app: 'QQMusic' },
  { key: 'e', app: 'Preview' },
  // { key: 'r', app: 'Alimeeting' },
  // Tblive = DingTalk Meeting & Webinar
  {
    key: 'r',
    app: '/Applications/Antding.app/Contents/Frameworks/Tblive.app/Contents/MacOS/Tblive',
    fallback:
      '/Applications/Antding.app/Contents/Frameworks/DingMeeting.app/Contents/MacOS/DingMeeting',
  },
  // { key: 'a', app: 'MacVim' },
  // { key: 'a', app: 'goneovim' },
  // { key: 'a', app: 'VimR' },
  { key: 'a', app: 'Neovide' },
  { key: 's', app: 'IntelliJ IDEA' },
  { key: 'd', app: 'WebStorm' },
  { key: 'f', app: 'DataGrip' },
  { key: 'x', app: 'Visual Studio Code' },
  // { key: 'x', app: 'GoLand' },
  // { key: 'z', app: 'Macdown' },
  // { key: 'z', app: 'Typora' },
  // { key: 'z', app: 'Atom' },
  // { key: 'z', app: 'Sublime Text' },
  { key: 'z', app: 'Obsidian' },
  // { key: ',', app: 'Airmail' },
  // { key: ',', app: 'Spark' },
  { key: ',', app: 'Yuque' },
  { key: '.', app: 'Mail' },
  // { key: '.', app: 'Alternote' },
  { key: '/', app: 'Finder' },
];

// Move / resize bindings expressed as frame deltas. Add a row = add a gesture.
interface WindowAdjust {
  key: string;
  mod: Phoenix.ModifierKey[];
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}
const WINDOW_ADJUST: WindowAdjust[] = [
  // Move (MASH_CTRL): shift the frame, keep size.
  { key: 'left', mod: MASH_CTRL, dx: -100, dy: 0, dw: 0, dh: 0 },
  { key: 'right', mod: MASH_CTRL, dx: 100, dy: 0, dw: 0, dh: 0 },
  { key: 'up', mod: MASH_CTRL, dx: 0, dy: -100, dw: 0, dh: 0 },
  { key: 'down', mod: MASH_CTRL, dx: 0, dy: 100, dw: 0, dh: 0 },
  // Enlarge (MASH_CTRL_SHIFT): grow toward the given direction.
  { key: 'left', mod: MASH_CTRL_SHIFT, dx: -100, dy: 0, dw: 100, dh: 0 },
  { key: 'right', mod: MASH_CTRL_SHIFT, dx: 0, dy: 0, dw: 100, dh: 0 },
  { key: 'up', mod: MASH_CTRL_SHIFT, dx: 0, dy: -100, dw: 0, dh: 100 },
  { key: 'down', mod: MASH_CTRL_SHIFT, dx: 0, dy: 0, dw: 0, dh: 100 },
];

export { APP_LAUNCH, WINDOW_ADJUST };
