import { APP_LAUNCH, MASH_CTRL } from '../config';
import { callApp } from '../features/app';

export function registerAppHotkeys(): void {
  APP_LAUNCH.forEach((binding) => {
    Key.on(binding.key, MASH_CTRL, () => callApp(binding.app, binding.fallback));
  });
}
