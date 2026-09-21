#!/usr/bin/env bash
# ==============================================================================
# AI Product Studio & Live Multimodal Copilot — One-Command Cloud Run Deployer
# ==============================================================================
# Enables required Google Cloud APIs, provisions a dedicated least-privilege
# Service Account, binds GEMINI_API_KEY from Secret Manager, and deploys to
# Cloud Run with WebSocket session affinity enabled.
#
# Usage:
#   export GOOGLE_CLOUD_PROJECT="your-gcp-project-id"
#   export GEMINI_API_KEY="your-gemini-api-key"
#   ./deploy-cloudrun.sh
# ==============================================================================

set -euo pipefail

PROJECT_ID="${GOOGLE_CLOUD_PROJECT:?Please set GOOGLE_CLOUD_PROJECT}"
REGION="${GOOGLE_CLOUD_REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-ai-product-studio}"
SA_NAME="ai-product-studio-sa"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
SECRET_NAME="GEMINI_API_KEY"

echo "==> [1/5] Enabling required Google Cloud APIs in project: ${PROJECT_ID}"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  --project="${PROJECT_ID}"

echo "==> [2/5] Creating dedicated least-privilege Service Account: ${SA_EMAIL}"
if ! gcloud iam service-accounts describe "${SA_EMAIL}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud iam service-accounts create "${SA_NAME}" \
    --display-name="AI Product Studio Cloud Run Service Account" \
    --project="${PROJECT_ID}"
fi

echo "==> [3/5] Ensuring Secret Manager secret '${SECRET_NAME}' exists"
if ! gcloud secrets describe "${SECRET_NAME}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud secrets create "${SECRET_NAME}" \
    --replication-policy="automatic" \
    --project="${PROJECT_ID}"
fi

if [[ -n "${GEMINI_API_KEY:-}" ]]; then
  printf "%s" "${GEMINI_API_KEY}" | gcloud secrets versions add "${SECRET_NAME}" \
    --data-file=- \
    --project="${PROJECT_ID}"
fi

echo "==> [4/5] Granting Secret Accessor & Vertex AI User roles to ${SA_EMAIL}"
gcloud secrets add-iam-policy-binding "${SECRET_NAME}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor" \
  --project="${PROJECT_ID}"

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/aiplatform.user"

echo "==> [5/5] Deploying ${SERVICE_NAME} to Cloud Run (${REGION})"
gcloud run deploy "${SERVICE_NAME}" \
  --source=. \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --service-account="${SA_EMAIL}" \
  --set-secrets="GEMINI_API_KEY=${SECRET_NAME}:latest" \
  --session-affinity \
  --timeout=300 \
  --allow-unauthenticated

echo "==> Deployment complete!"
