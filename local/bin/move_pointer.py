#!/usr/bin/env python

import os

import argparse
import subprocess

CLICLICK_CMD = '/usr/local/bin/cliclick'


def save(screen):
    process = subprocess.Popen(
        ["""%s p | awk '{print $4}'""" %CLICLICK_CMD],
        shell=True,
        stdout=subprocess.PIPE
    )
    x, y = process.communicate()[0].strip().split(',')
    x = int(x)
    y = int(y)
    subprocess.call(
        ['echo "%d,%d" > /tmp/mouse_%d' %(x, y, screen)],
        shell=True,
    )

def restore(screen):
    file_name = '/tmp/mouse_%d' %screen
    if not os.path.isfile(file_name):
        return

    process = subprocess.Popen(["""cat %s""" %file_name],
                              shell=True,
                              stdout=subprocess.PIPE)
    pos_str = process.communicate()[0].strip()
    if pos_str == '':
        return

    x, y = pos_str.split(',')
    x = int(x)
    y = int(y)
    subprocess.call(['%s m:%d,%d' %(CLICLICK_CMD, x, y)], shell=True)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-s', '--screen', type=int, default=0)
    parser.add_argument('--set', action='store_true',)

    args = parser.parse_args()

    if args.set:
        save(args.screen)
    else:
        restore(args.screen)


if __name__ == '__main__':
    main()
