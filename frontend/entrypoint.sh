#!/bin/sh

if [ $PRODUCTION = True ]
then
    echo "No need to start frontend for production"
else
    npm start
fi
