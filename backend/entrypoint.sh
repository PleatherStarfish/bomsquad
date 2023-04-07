#!/bin/bash

python manage.py migrate
python manage.py createsuperuser --noinput

if [ $PRODUCTION = True ]
then
  cd /__frontend
  npm install -g
  npm run build
  cd /code
  python manage.py collectstatic --noinput --clear
  gunicorn django_project.wsgi --bind :8000 --workers 2 --reload
else
  python manage.py collectstatic --noinput --clear
  python manage.py runserver 0.0.0.0:8000
fi
