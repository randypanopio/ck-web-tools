# Built from https://www.youtube.com/watch?v=TFsFLzNL5Fk
FROM python:3.9-alpine
LABEL maintainer="randypanopio@gmail.com"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY requirements.txt /requirements.txt
COPY ./app /app

# RUN python -m venv /py && \
#     /py/bin/pip install -r /requirements.txt && \
#     adduser --disabled-password --no-create-home django-user
RUN pip install -r requirements.txt

ENV PATH="/py/bin:$PATH"

USER django-user
