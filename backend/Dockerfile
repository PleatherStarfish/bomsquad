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

RUN apt update && apt install -y curl
RUN apt-get update && apt-get install -y make
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt -y install nodejs

RUN mkdir -p /code/media

COPY . .
COPY entrypoint.sh /entrypoint.sh

EXPOSE 8000

RUN chmod +x entrypoint.sh

ENTRYPOINT /entrypoint.sh