#!/bin/bash

set -e
set -x

TARGET=$1

REPO_PATH=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename $REPO_PATH)

mvn clean package
GIT_HASH=$(git rev-parse --short HEAD)
BRANCH=$REPO_NAME-release-binary-$(date +%y%m%d.%H%M)-$GIT_HASH
TAG=$REPO_NAME-$(date +%y%m%d.%H%M)
git tag $TAG
git push origin $TAG
git checkout --orphan $BRANCH
cp $TARGET .
git rm --cached -r .
git add -f *.jar
git commit -a -m 'release'
git push origin HEAD
git checkout -f master
git branch -D $BRANCH
