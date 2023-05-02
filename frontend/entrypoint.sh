#!/bin/sh

if [ "$PRODUCTION" = true ]; then
    npm run build
else
    npm run start
fi