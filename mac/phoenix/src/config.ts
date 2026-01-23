const MASH: Phoenix.ModifierKey[] = ['alt'];
const MASH_CTRL: Phoenix.ModifierKey[] = ['alt', 'ctrl'];
const MASH_SHIFT: Phoenix.ModifierKey[] = ['alt', 'shift'];
const MASH_CTRL_SHIFT: Phoenix.ModifierKey[] = ['alt', 'ctrl', 'shift'];
const MOUSE_POSITIONS: { [name: number]: Point } = {};
const HIDE_INACTIVE_WINDOW_TIME = 10; // minitus
const ACTIVE_WINDOWS_TIMES: { [name: number]: number } = {};
const DEFAULT_WIDTH = 1280;
const WORK_SPACE_INDEX_MAP: { [name: number]: number } = {
  1: 0, // one display case
  2: 3, // two display case
}; // is a dict, key is display count, val is work space
const SECOND_WORK_SPACE_INDEX_MAP: { [name: number]: number } = {
  1: 0, // one display case
  2: 0, // two display case
}; // is a dict, key is display count, val is work space
const PARK_SPACE_INDEX_MAP: { [name: number]: number } = {
  1: 2,
  2: 2,
};
const PARK_SPACE_APP_INDEX_MAP: { [name: string]: number } = {
  iTerm: 0,
  'Google Chrome': 0,
  Chromium: 0,
  Firefox: 0,
  QQ: 1,
  Dingtalk: 1,
  WeChat: 2,
  'Electronic WeChat': 2,
  Mail: 2,
  Airmail: 2,
};
const A_BIG_PIXEL = 10000;
// TODO MAC_SCREEN_IN_THE_RIGHT to DISPLAYS_ORDER
const MAC_SCREEN_IN_THE_RIGHT = true;
const DISPLAYS_ORDER = {};
// const MAC_SCREEN_IN_THE_RIGHT = false;
const RESIZE_WITH_RATIO = false;

export {
  MAC_SCREEN_IN_THE_RIGHT,
  MASH,
  MASH_CTRL,
  MASH_SHIFT,
  MASH_CTRL_SHIFT,
  MOUSE_POSITIONS,
  HIDE_INACTIVE_WINDOW_TIME,
  ACTIVE_WINDOWS_TIMES,
  DEFAULT_WIDTH,
  WORK_SPACE_INDEX_MAP,
  SECOND_WORK_SPACE_INDEX_MAP,
  PARK_SPACE_APP_INDEX_MAP,
  A_BIG_PIXEL,
  RESIZE_WITH_RATIO,
};
