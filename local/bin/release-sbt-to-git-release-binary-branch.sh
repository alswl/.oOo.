#!/bin/bash

set -x

sbt clean assembly

GIT_HASH=$(git rev-parse --short HEAD)
BRANCH=release-binary-$(date +%y%m%d.%H%M)-$GIT_HASH
TAG=v-$(date +%y%m%d.%H%M)

git tag $TAG
git push origin $TAG
git checkout --orphan $BRANCH
cp target/scala-*/*-assembly-*.jar .
git rm --cached -r .
cp *-assembly-*.jar .
git add -f *.jar
git commit -a -m 'release'
git push origin HEAD
git checkout -f master
git branch -D $BRANCH
