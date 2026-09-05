#!/usr/bin/env python3

import sys


def main():
    print("SET sql_mode='NO_BACKSLASH_ESCAPES';")
    lines = sys.stdin.read().splitlines()
    for line in lines:
        process_line(line)


def process_line(line):
    if (
            line.startswith("PRAGMA") or
            line.startswith("BEGIN TRANSACTION;") or
            line.startswith("COMMIT;") or
            line.startswith("DELETE FROM sqlite_sequence;") or
            line.startswith("INSERT INTO \"sqlite_sequence\"")
    ):
        return
    line = line.replace("AUTOINCREMENT", "AUTO_INCREMENT")
    line = line.replace("DEFAULT 't'", "DEFAULT '1'")
    line = line.replace("DEFAULT 'f'", "DEFAULT '0'")
    line = line.replace(",'t'", ",'1'")
    line = line.replace(",'f'", ",'0'")
    in_string = False
    new_line = ''
    index = 0
    while index < len(line):
        c = line[index]
        if not in_string:
            if c == "'":
                in_string = True
            elif c == '"':
                new_line += '`'
                index += 1
                continue
        elif c == "'":
            if index + 1 < len(line) and line[index + 1] == "'":
                new_line += "''"
                index += 2
                continue
            in_string = False
        new_line += c
        index += 1
    print(new_line)


if __name__ == "__main__":
    main()
