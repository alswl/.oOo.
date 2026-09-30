#!/usr/bin/env python3
"""Synchronize xbar plugin symlinks declared by dotfile repositories.

Each repository owns mac/Library/Application Support/xbar/plugins.toml.  The
configuration is deliberately local to the plugin source, while this program
owns the single destination directory xbar scans.
"""

from __future__ import annotations

import argparse
import os
import sys
import tomllib
from dataclasses import dataclass
from pathlib import Path


CONFIG_RELATIVE_PATH = Path("mac/Library/Application Support/xbar/plugins.toml")
DEFAULT_TARGET = Path.home() / "Library/Application Support/xbar/plugins"


@dataclass(frozen=True)
class Plugin:
    source: Path
    enabled: bool
    repository: Path

    @property
    def destination_name(self) -> str:
        return self.source.name


def fail(message: str) -> None:
    print(f"error: {message}", file=sys.stderr)
    raise SystemExit(2)


def read_config(config_path: Path) -> list[Plugin]:
    try:
        document = tomllib.loads(config_path.read_text())
    except FileNotFoundError:
        fail(f"configuration not found: {config_path}")
    except tomllib.TOMLDecodeError as error:
        fail(f"invalid TOML in {config_path}: {error}")

    entries = document.get("plugins") if isinstance(document, dict) else None
    if not isinstance(entries, dict):
        fail(f"{config_path}: plugins must be a table of filename = true/false entries")

    source_dir = config_path.parent / "plugins"
    repository = config_path.parents[4]
    plugins: list[Plugin] = []
    names: set[str] = set()
    for name, enabled in entries.items():
        if not isinstance(name, str) or Path(name).name != name or not name.endswith(".sh"):
            fail(f"{config_path}: plugin names must be filenames ending in .sh")
        if not isinstance(enabled, bool):
            fail(f"{config_path}: {name} must be true or false")
        if name in names:
            fail(f"{config_path}: duplicate plugin entry: {name}")
        names.add(name)
        source = source_dir / name
        if not source.is_file():
            fail(f"{config_path}: plugin source not found: {source}")
        plugins.append(Plugin(source=source, enabled=enabled, repository=repository))
    return plugins


def managed_link(destination: Path, source: Path) -> bool:
    return destination.is_symlink() and destination.resolve(strict=False) == source.resolve()


def apply(action: str, dry_run: bool) -> None:
    print(f"would {action}" if dry_run else action)


def sync(plugins: list[Plugin], target: Path, dry_run: bool) -> int:
    enabled: dict[str, Plugin] = {}
    for plugin in plugins:
        if not plugin.enabled:
            continue
        previous = enabled.get(plugin.destination_name)
        if previous and previous.source.resolve() != plugin.source.resolve():
            fail(
                f"enabled plugin name collision: {plugin.destination_name} is declared by "
                f"{previous.repository} and {plugin.repository}"
            )
        enabled[plugin.destination_name] = plugin

    if enabled and not target.exists():
        apply(f"create directory {target}", dry_run)
        if not dry_run:
            target.mkdir(parents=True)

    for plugin in plugins:
        destination = target / plugin.destination_name
        if plugin.enabled:
            if managed_link(destination, plugin.source):
                print(f"ok      {plugin.destination_name}")
            elif destination.exists() or destination.is_symlink():
                print(f"conflict {destination} (left unchanged)", file=sys.stderr)
            else:
                apply(f"link    {destination} -> {plugin.source}", dry_run)
                if not dry_run:
                    destination.symlink_to(plugin.source)
        elif managed_link(destination, plugin.source):
            apply(f"unlink  {destination}", dry_run)
            if not dry_run:
                destination.unlink()
        else:
            print(f"off     {plugin.destination_name}")
    return 0


def status(plugins: list[Plugin], target: Path) -> int:
    result = 0
    for plugin in plugins:
        destination = target / plugin.destination_name
        linked = managed_link(destination, plugin.source)
        state = "enabled" if plugin.enabled else "disabled"
        actual = "linked" if linked else "absent"
        if destination.exists() or destination.is_symlink():
            actual = "linked" if linked else "conflict"
        print(f"{state:8} {actual:8} {plugin.destination_name} ({plugin.repository})")
        if (plugin.enabled and not linked) or (not plugin.enabled and linked):
            result = 1
    return result


def main() -> int:
    script = Path(__file__).resolve()
    own_repository = script.parents[2]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", nargs="?", choices=("sync", "status"), default="sync")
    parser.add_argument("--repo", action="append", type=Path, default=[], help="repository containing an xbar plugins.toml")
    parser.add_argument("--config", action="append", type=Path, default=[], help="explicit plugins.toml path")
    parser.add_argument("--target", type=Path, default=Path(os.environ.get("XBAR_PLUGIN_DIR", DEFAULT_TARGET)))
    parser.add_argument("-n", "--dry-run", action="store_true")
    args = parser.parse_args()

    configs = [own_repository / CONFIG_RELATIVE_PATH]
    configs.extend(repository / CONFIG_RELATIVE_PATH for repository in args.repo)
    configs.extend(args.config)
    unique_configs = list(dict.fromkeys(path.resolve() for path in configs))
    plugins = [plugin for config in unique_configs for plugin in read_config(config)]
    return sync(plugins, args.target.expanduser(), args.dry_run) if args.command == "sync" else status(plugins, args.target.expanduser())


if __name__ == "__main__":
    raise SystemExit(main())
