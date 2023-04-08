#!/bin/sh

if [ $PRODUCTION = True ]
then
    npm run build
else
    npm run start
fi
