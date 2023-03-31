#!/bin/sh

if [ $PRODUCTION = True ]
then
    npm run build
    mv /app/build/index.html /app/backend/templates/frontend.html
    mv /app/build/static/css/* /app/backend/staticfiles/css/
    mv /app/build/static/js/* /app/backend/staticfiles/js/
else
    npm start
fi
