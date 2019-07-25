export {mash, mashShift, mashCtrl, mousePositions, HIDE_INACTIVE_WINDOW_TIME, ACTIVE_WINDOWS_TIMES, DEFAULT_WIDTH,
WORK_SPACE_INDEX_MAP, SECOND_WORK_SPACE_INDEX_MAP, PARK_SPACE_APP_INDEX_MAP, A_BIG_PIXEL}

let mash: Phoenix.ModifierKey[] = ['alt'];
let mashShift: Phoenix.ModifierKey[] = ['alt', 'shift'];
let mashCtrl: Phoenix.ModifierKey[] = ['alt', 'ctrl'];
let mousePositions: { [name: number]: Point } = {};
let HIDE_INACTIVE_WINDOW_TIME = 10; // minitus
let ACTIVE_WINDOWS_TIMES: { [name: number]: number } = {};
let DEFAULT_WIDTH = 1280;
let WORK_SPACE_INDEX_MAP: { [name: number]: number } = {}; // is a dict, key is display count, val is work space
WORK_SPACE_INDEX_MAP[1] = 0; // one display case
WORK_SPACE_INDEX_MAP[2] = 3; // two display case
let SECOND_WORK_SPACE_INDEX_MAP: { [name: number]: number } = {}; // is a dict, key is display count, val is work space
SECOND_WORK_SPACE_INDEX_MAP[1] = 0; // one display case
SECOND_WORK_SPACE_INDEX_MAP[2] = 0; // two display case
let PARK_SPACE_INDEX_MAP: { [name: number]: number } = {};
PARK_SPACE_INDEX_MAP[1] = 2;
PARK_SPACE_INDEX_MAP[2] = 2;
let PARK_SPACE_APP_INDEX_MAP: { [name: string]: number } = {};
PARK_SPACE_APP_INDEX_MAP['iTerm'] = 0;
PARK_SPACE_APP_INDEX_MAP['Google Chrome'] = 0;
PARK_SPACE_APP_INDEX_MAP['Chromium'] = 0;
PARK_SPACE_APP_INDEX_MAP['Firefox'] = 0;
//PARK_SPACE_APP_INDEX_MAP['Safari'] = 1;
PARK_SPACE_APP_INDEX_MAP['QQ'] = 1;
PARK_SPACE_APP_INDEX_MAP['Dingtalk'] = 1;
PARK_SPACE_APP_INDEX_MAP['WeChat'] = 2;
PARK_SPACE_APP_INDEX_MAP['Electronic WeChat'] = 2;
PARK_SPACE_APP_INDEX_MAP['BearyChat'] = 1;
PARK_SPACE_APP_INDEX_MAP['Mail'] = 2;
PARK_SPACE_APP_INDEX_MAP['Airmail'] = 2;
let A_BIG_PIXEL = 10000;
