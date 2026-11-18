FROM python:3.12-slim

WORKDIR /app

# Install C++ compiler required for IsoSpecPy CFFI extension
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY vendor/ vendor/
COPY app/ app/

ENV PYTHONUNBUFFERED=1
ENV PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
