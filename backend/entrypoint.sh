#!/bin/bash

python manage.py migrate
python manage.py createsuperuser --noinput
python manage.py collectstatic --noinput

if [ $PRODUCTION = True ]
then
  gunicorn django_project.wsgi --bind :8000 --workers 2 --reload
else
  python manage.py runserver 0.0.0.0:8000
fi