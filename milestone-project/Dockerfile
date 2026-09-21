# Production Cloud Run Container — AI Product Studio & Live Multimodal Copilot
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

# Create a dedicated non-root runtime user for least-privilege execution
RUN groupadd --system studio && useradd --system --gid studio --create-home studio

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
RUN chown -R studio:studio /app

USER studio
EXPOSE 8080

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
