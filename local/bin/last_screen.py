#!/usr/bin/env python

import os

import argparse
import subprocess

PATH = '/tmp/last_screen'
DEFAULT = '0'


def save(value):
    process = subprocess.Popen(
        ["""echo %s > %s""" %(value, PATH)],
        shell=True,
        stdout=subprocess.PIPE
    )

def get():
    if not os.path.isfile(PATH):
        return DEFAULT

    process = subprocess.Popen(["""cat %s""" %PATH],
                              shell=True,
                              stdout=subprocess.PIPE)
    return process.communicate()[0].strip()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--set')

    args = parser.parse_args()

    if args.set:
        save(args.set)
    else:
        print get()


if __name__ == '__main__':
    main()

