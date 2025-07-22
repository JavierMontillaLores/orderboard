# syntax=docker/dockerfile:1
FROM python:3.12.7-slim
WORKDIR /agent

# Install git and other system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# 🚩 Hardcoded PAT (only for local testing)
ARG GIT_TOKEN

# Use the token to configure git for private repo clones
RUN git config --global url."https://${GIT_TOKEN}@github.azc.ext.hp.com/".insteadOf "https://github.azc.ext.hp.com/" \
    && pip install --no-cache-dir -r requirements.txt \
    && git config --global --unset url."https://${GIT_TOKEN}@github.azc.ext.hp.com/".insteadOf

COPY main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]