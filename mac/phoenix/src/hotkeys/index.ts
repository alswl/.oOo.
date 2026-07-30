import { registerAppHotkeys } from './app';
import { registerMouseHotkeys } from './mouse';
import { registerScreenHotkeys } from './screen';
import { registerSpaceHotkeys } from './space';
import { registerWindowHotkeys } from './window';

export function registerHotkeys(): void {
  registerAppHotkeys();
  registerScreenHotkeys();
  registerWindowHotkeys();
  registerMouseHotkeys();
  registerSpaceHotkeys();
}
