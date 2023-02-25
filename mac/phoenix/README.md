# Phoenix Configuration

## Snapshot

Application launch:

![](./_asserts/application-launch.gif)

Application in window switch:

![](./_asserts/application-switch.gif)


Window movement:

![](./_asserts/window.gif)

Screen movement:

TODO

## Usage

- Application launch
  - mod + escape => iTerm
  - mod + \` => iTerm
  - mod + 1 => Browser (Microsoft Edge)
  - mod + 2 => Browser (Safari)
  - mod + 3 => IM (Dingtalk or Wchat)
  - mod + 4 => IM (Wechat of Browser)
  - mod + 8 => Music (Apple Music)
  - mod + 9 => Music (Netease Music
  - mod + e => Preview
  - mod + r => Meeting
  - mod + a => Editor (VimR)
  - mod + s => Editor (IntelliJ IDEA)
  - mod + d => Editor (Visual Studio Code)
  - mod + f => Editor (Clion)
  - mod + x => Editor (GoLand)
  - mod + z => Editor (Obsidian)
  - mod + , => Editor (Yuque)
  - mod + . => Editor (Quiver or Motion)
  - mod + / => Finder
- Screen
  - mod + l => Next screen
  - mod + h => Previous screen
  - mod + ctrl + o => Move current window to next screen
  - mod + ctrl + i => Move current window to previouse screen
- Window
  - mod + shift + m => Toogle window maximize
  - mod + - => Window smaller
  - mod + = => Window larger
  - mod + m => Move window to screen centeral
  - mod + \\ => Window height max
  - mod + k => Next window of screen
  - mod + j => Previous window of screen
  - mod + ctrl + left => Move window left
  - mod + ctrl + right => Move window right
  - mod + ctrl + up => Move window up
  - mod + ctrl + down => Move window down
  - mod + ctrl + h => Move window to lef of screen
  - mod + ctrl + l => Move window to righ of screen
  - mod + ctrl + k => Move window to to of screen
  - mod + ctrl + j => Move window to bottom of screen
  - mod + shift + h => Move window to left, and resize half of screen
  - mod + shift + l => Move window to right, and resize half of screen
  - mod + shift + k => Move window to top, and resize half of screen
  - mod + shift + j => Move window to bottom, and resize half of screen
  - mod + shift + \\ => Window width max
  - mod + shift + , => Winow larger to left
  - mod + shift + . => Winow larger to right
  - mod + ctrl + \\ => Auto range windows
- Mouse
  - mod + space => Move pointer to current window
- Space
  - mod + shift + i => move window to previous space
  - mod + shift + o => move window to next space
  - mod + delete => move window to parking space
  - mod + ctrl + enter => move window to working space



## Build and install

```
npm install
# cnpm install for Mainland China user
npx webpack
cp dist/phoenix.js $HOME/.phoenix.js
```

More details in [Windows management for hacker | Log4D](https://blog.alswl.com/2016/04/windows-management-for-hacker/)
