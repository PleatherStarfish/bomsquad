# Pull base image
FROM python:3.10-slim-buster

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Create and set work directory called `app`
WORKDIR /code/

# Install dependencies
COPY requirements.txt /tmp/requirements.txt

RUN set -ex && \
    pip install --upgrade pip && \
    pip install -r /tmp/requirements.txt && \
    rm -rf /root/.cache/

RUN apt-get update && \
    apt-get install -y nodejs npm && \
    npm install -g npm@latest && \
    npm install -g postcss-cli@latest

COPY . .
COPY entrypoint.sh /entrypoint.sh

EXPOSE 8000

RUN chmod +x entrypoint.sh

ENTRYPOINT /entrypoint.sh