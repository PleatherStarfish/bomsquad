#!/bin/bash

python manage.py migrate

if [ "$PRODUCTION" != "True" ]; then
  python manage.py createsuperuser --noinput
fi

# Collect static files
python manage.py collectstatic --noinput --clear --ignore "node_modules" --ignore "rest_framework" --ignore "import_export" --ignore "drf-yasg" --ignore ".DS_Store" --ignore ".DS_Store.*"

if [ "$PRODUCTION" = True ]
then
  gunicorn django_project.wsgi --bind :8000 --workers 2 --reload
else
  python manage.py runserver 0.0.0.0:8000
fi
