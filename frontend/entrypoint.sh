#!/bin/sh

npm ci

if [ $PRODUCTION = True ]
then
    npm run build
else
    npm run start
fi
