# Directorio Maestro de Referencias Públicas Verificadas y Documentación Oficial

Este documento recopila todos los enlaces públicos oficiales, repositorios de código abierto, guías de seguridad y referencias técnicas utilizadas a lo largo del curso **Google AI Studio y Gemini API: De Cero a Experto (Zero to Hero)**.

Todos los enlaces contenidos en este directorio apuntan exclusivamente a documentación pública oficial y verificada.

---

## 1. Portales Oficiales y Consolas de Gestión

- **Google AI Studio (Portal Principal y Workbench)**: [https://aistudio.google.com](https://aistudio.google.com)
- **Gestión de Llaves de API en Google AI Studio**: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **Documentación Oficial para Desarrolladores de Google AI**: [https://ai.google.dev](https://ai.google.dev)
- **Consola de Google Cloud Platform (GCP)**: [https://console.cloud.google.com](https://console.cloud.google.com)
- **Google Antigravity (Plataforma y Entorno de Agentes Autónomos)**: [https://antigravity.google](https://antigravity.google)
- **Documentación Oficial de Google Antigravity**: [https://antigravity.google/docs](https://antigravity.google/docs)

---

## 2. SDKs Oficiales Unificados (`google-genai`)

- **SDK Oficial de Google Gen AI para Python (`google-genai`)**: [https://github.com/googleapis/python-genai](https://github.com/googleapis/python-genai)
- **SDK Oficial de Google Gen AI para TypeScript y JavaScript (`@google/genai`)**: [https://github.com/googleapis/js-genai](https://github.com/googleapis/js-genai)
- **Guía Oficial de Bibliotecas y SDKs de Gemini API**: [https://ai.google.dev/gemini-api/docs/libraries](https://ai.google.dev/gemini-api/docs/libraries)
- **Guía Oficial de Migración a la Interactions API**: [https://ai.google.dev/gemini-api/docs/migrate-to-interactions](https://ai.google.dev/gemini-api/docs/migrate-to-interactions)

---

## 3. Modelos Gemini, Interactions API, Razonamiento y Capacidades Multimodales

### Superficie de API

- **Interactions API — Visión General (superficie estándar, estado en servidor)**: [https://ai.google.dev/gemini-api/docs/interactions-overview](https://ai.google.dev/gemini-api/docs/interactions-overview)
- **Guía Oficial de Migración a la Interactions API**: [https://ai.google.dev/gemini-api/docs/migrate-to-interactions](https://ai.google.dev/gemini-api/docs/migrate-to-interactions)

### Modelos y Razonamiento

- **Catálogo Oficial de Modelos Gemini (`gemini-3.8-flash`, `gemini-3.1-pro-preview`, Live, Nano Banana, Omni)**: [https://ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)
- **Razonamiento y Nivel de Pensamiento (`thinking_level`: `low` / `medium` / `high`)**: [https://ai.google.dev/gemini-api/docs/thinking](https://ai.google.dev/gemini-api/docs/thinking)
- **Salidas Estructuradas (`response_format` con JSON Schema y Pydantic)**: [https://ai.google.dev/gemini-api/docs/structured-output](https://ai.google.dev/gemini-api/docs/structured-output)
- **Llamada a Funciones y Herramientas (Function Calling / Tool Use)**: [https://ai.google.dev/gemini-api/docs/function-calling](https://ai.google.dev/gemini-api/docs/function-calling)

### Tiempo Real (Live API)

- **Live API — Visión General (`gemini-3.8-live`)**: [https://ai.google.dev/gemini-api/docs/live-api](https://ai.google.dev/gemini-api/docs/live-api)
- **Live API — Inicio Rápido con el SDK**: [https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk)
- **Live API — Uso de Herramientas**: [https://ai.google.dev/gemini-api/docs/live-api/tools](https://ai.google.dev/gemini-api/docs/live-api/tools)

### Generación Multimedia

- **Generación y Edición de Imágenes con Nano Banana (`gemini-3.1-flash-image`, `gemini-3-pro-image`, `gemini-3.1-flash-lite-image`)**: [https://ai.google.dev/gemini-api/docs/image-generation](https://ai.google.dev/gemini-api/docs/image-generation)
- **Generación y Edición de Video con Gemini Omni Flash (`gemini-omni-1.1-flash`)**: [https://ai.google.dev/gemini-api/docs/omni](https://ai.google.dev/gemini-api/docs/omni)
- **Marca de Agua SynthID en Contenido Generado**: [https://ai.google.dev/responsible/docs/safeguards/synthid](https://ai.google.dev/responsible/docs/safeguards/synthid)

---

## 4. Gobernanza, IAM, Cuotas, Facturación y Privacidad

- **Precios y Niveles de Servicio (Free Tier vs. Pay-as-you-go)**: [https://ai.google.dev/pricing](https://ai.google.dev/pricing)
- **Límites de Tasa y Cuotas (RPM, TPM y RPD)**: [https://ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- **Términos de Servicio y Privacidad de Datos de Gemini API**: [https://ai.google.dev/gemini-api/terms](https://ai.google.dev/gemini-api/terms)
- **Control de Acceso e IAM en Google Cloud Vertex AI**: [https://cloud.google.com/vertex-ai/docs/general/access-control](https://cloud.google.com/vertex-ai/docs/general/access-control)
- **Configuración de Presupuestos y Alertas en Google Cloud Billing**: [https://cloud.google.com/billing/docs/how-to/budgets](https://cloud.google.com/billing/docs/how-to/budgets)

---

## 5. Despliegue a Producción, CI/CD y Seguridad en la Nube

- **Documentación Oficial de Google Cloud Run**: [https://cloud.google.com/run/docs](https://cloud.google.com/run/docs)
- **Soporte de WebSockets en Google Cloud Run**: [https://cloud.google.com/run/docs/triggering/websockets](https://cloud.google.com/run/docs/triggering/websockets)
- **Uso de Secretos de Secret Manager en Cloud Run**: [https://cloud.google.com/run/docs/configuring/services/secrets](https://cloud.google.com/run/docs/configuring/services/secrets)
- **GitHub Action Oficial de Autenticación con Workload Identity Federation (`google-github-actions/auth`)**: [https://github.com/google-github-actions/auth](https://github.com/google-github-actions/auth)
- **GitHub Action Oficial de Despliegue en Cloud Run (`google-github-actions/deploy-cloudrun`)**: [https://github.com/google-github-actions/deploy-cloudrun](https://github.com/google-github-actions/deploy-cloudrun)
- **Documentación de Seguridad y OIDC en GitHub Actions**: [https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- **Filtros de Seguridad (Safety Settings) en la API de Gemini**: [https://ai.google.dev/gemini-api/docs/safety-settings](https://ai.google.dev/gemini-api/docs/safety-settings)
