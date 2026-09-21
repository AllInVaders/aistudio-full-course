# Curso Completo de Google AI Studio y Gemini API: De Cero a Experto (Zero to Hero)

[![Google AI Studio](https://img.shields.io/badge/Google%20AI%20Studio-Oficial-4285F4?logo=google&logoColor=white)](https://aistudio.google.com)
[![Google Gen AI SDK](https://img.shields.io/badge/SDK-google--genai-34A853?logo=python&logoColor=white)](https://github.com/googleapis/python-genai)
[![Cloud Run](https://img.shields.io/badge/Despliegue-Google%20Cloud%20Run-FBBC04?logo=googlecloud&logoColor=black)](https://cloud.google.com/run)
[![Google Antigravity](https://img.shields.io/badge/Agentes-Google%20Antigravity-EA4335)](https://antigravity.google)

Bienvenido al curso práctico integral en español para dominar **Google AI Studio**, el **SDK unificado de Google Gen AI (`google-genai`)**, la **API Multimodal en Vivo (Gemini Live API)**, el despliegue seguro en **Google Cloud Run** y la orquestación de agentes autónomos con **Google Antigravity**.

Este repositorio está diseñado bajo un enfoque **De Cero a Experto (Zero to Hero)**: comenzamos desde la creación de tu primera llave de API y la configuración de permisos IAM de mínimo privilegio, y avanzamos paso a paso hasta desplegar en producción un **Copiloto Multimodal en Vivo y Estudio Creativo de Productos (AI Product Studio)** con CI/CD sin llaves estáticas (Workload Identity Federation).

---

## Arquitectura General del Curso y del Proyecto Hito

A lo largo de los 4 módulos y el cierre sorpresa, construirás y evolucionarás una aplicación real de nivel productivo: **AI Product Studio & Copiloto Multimodal en Vivo**.

```mermaid
flowchart LR
    subgraph Cliente["Frontend / Cliente Web & Voz"]
        UI["Interfaz Web + Captura Audio/Video PCM/WebRTC"]
    end

    subgraph CloudRun["Backend en Google Cloud Run (FastAPI)"]
        WS["Servidor WebSocket & API REST"]
        SEC["Capa de Seguridad: Rate Limit, CORS, Sanitización"]
        SM["Google Cloud Secret Manager"]
    end

    subgraph Gemini["Modelos Google Gen AI (SDK google-genai)"]
        FLASH["Gemini 3.7 Flash (Baja Latencia + Thinking Budget)"]
        PRO["Gemini 3.1 Pro (Razonamiento Complejo + JSON Schema)"]
        MEDIA["Gemini 3.1 Flash Image (Nano Banana 2) & Gemini Omni 1.1 Flash (Generación Visual y Video)"]
        LIVE["Gemini Live API (Audio/Video Bidireccional + VAD)"]
    end

    subgraph Antigravity["Graduación: Google Antigravity"]
        AG["Arnés de Agentes Autónomos + MCP + SKILL.md"]
    end

    UI <-->|"WSS / HTTPS"| SEC
    SEC --> WS
    SM -.->|"Inyección Segura"| WS
    WS --> FLASH
    WS --> PRO
    WS --> MEDIA
    WS <-->|"Streaming Bidireccional + Tool Calling"| LIVE
    AG -.->|"Evolución y Mantenimiento Autónomo"| CloudRun
```

---

## Hoja de Ruta del Currículo (Curriculum Roadmap)

| Módulo | Título y Enfoque Técnico | Hito del Proyecto (Flagship Milestone) |
| :--- | :--- | :--- |
| **[Módulo 1](./module-01-setup-iam-billing/README.md)** | **Configuración e Introducción, Permisos IAM, Facturación, Usuarios y Panel de Control** | Configuración del entorno, comparativa AI Studio vs. Vertex AI, cuotas RPM/TPM/RPD, roles IAM de mínimo privilegio (`roles/aiplatform.user`, `roles/secretmanager.secretAccessor`, `roles/run.invoker`) y alertas de presupuesto. |
| **[Módulo 2](./module-02-basics-prompts-media-llms/README.md)** | **Fundamentos, Prompts, Instrucciones del Sistema, Generación Multimedia y Modelos de Lenguaje** | **Etapa 1 del Proyecto Hito**: Motor Creativo de *AI Product Studio* con Gemini 3.7 Flash/Pro, `thinking_config`, salidas estructuradas con Pydantic/Zod, Gemini 3.1 Flash Image (Nano Banana 2) y Gemini Omni 1.1 Flash. |
| **[Módulo 3](./module-03-live-agents-antigravity-sdk/README.md)** | **Modelos en Vivo (Live API), Agentes, Antigravity SDK y Aplicaciones** | **Etapa 2 del Proyecto Hito**: Copiloto Multimodal en Vivo con streaming WebSocket bidireccional (`client.aio.live.connect`), interrupciones de voz (*barge-in*), Function Calling y el SDK público de Google Antigravity (`antigravity.google`). |
| **[Módulo 4](./module-04-deploy-github-cloudrun-security/README.md)** | **Despliegue a Producción, Integración con GitHub, Cloud Run, Seguridad en tu App y Proyecto Hito** | **Etapa 3 del Proyecto Hito**: Contenedorización Docker, CI/CD con GitHub Actions + Workload Identity Federation (`google-github-actions/auth@v2`), Secret Manager, defensa contra inyección de prompts y despliegue en Cloud Run. |
| **[Cierre Sorpresa](./surprise-finisher-graduate-to-antigravity/README.md)** | **Graduación hacia Google Antigravity (`antigravity.google`)** | El salto de paradigma: de invocar APIs en scripts a orquestar agentes autónomos de ingeniería con `.agents/rules/`, `SKILL.md`, servidores MCP y subagentes paralelos. |
| **[Referencias](./REFERENCES.md)** | **Directorio Maestro de Referencias Públicas Verificadas** | Compendio completo de documentación oficial, SDKs, guías de seguridad y repositorios públicos. |

---

## Prerrequisitos Técnicos

Para aprovechar al máximo todos los laboratorios de este curso, asegúrate de contar con:

1. **Cuenta de Google y acceso a Google AI Studio**: Ingresa a [https://aistudio.google.com](https://aistudio.google.com) para generar tu llave de API gratuita en segundos.
2. **Proyecto de Google Cloud Platform (GCP)**: Necesario para los laboratorios de IAM, Secret Manager, Vertex AI y despliegue en Cloud Run ([https://console.cloud.google.com](https://console.cloud.google.com)).
3. **Entorno de Desarrollo Local**:
   - **Python 3.10+** (recomendado 3.11 o 3.12).
   - **Node.js 20+** y **npm** para los ejemplos en TypeScript/JavaScript.
   - **Docker Desktop** o Docker Engine para empaquetar el microservicio.
   - **Google Cloud CLI (`gcloud`)** instalado y autenticado.
   - **Cuenta de GitHub** para configurar el pipeline CI/CD con GitHub Actions.

---

## Regla de Oro del SDK: Usa Siempre el SDK Unificado `google-genai`

> [!IMPORTANT]
> **Aviso Crítico de Ecosistema**: En todos los módulos de este curso utilizamos exclusivamente el **SDK unificado oficial de Google Gen AI**:
> - **Python**: `pip install google-genai` (`from google import genai`)
> - **TypeScript / JavaScript**: `npm install @google/genai` (`import { GoogleGenAI } from '@google/genai'`)
>
> **NUNCA utilices el paquete heredado y obsoleto `google-generativeai`**. El nuevo SDK `google-genai` te permite cambiar entre llaves de API de Google AI Studio y autenticación empresarial de Vertex AI con una sola línea de configuración, y da acceso exclusivo a Gemini 3.7 / 3.1, Live API, Gemini 3.1 Flash Image (Nano Banana 2) y Gemini Omni 1.1 Flash.

### Verificación Rápida de Instalación (30 Segundos)

Ejecuta estos comandos en tu terminal para validar que tu entorno está listo antes de iniciar el Módulo 1:

```bash
# Crear y activar un entorno virtual en Python
python3 -m venv .venv
source .venv/bin/activate

# Instalar el SDK oficial unificado de Google Gen AI y Pydantic
pip install -U google-genai pydantic fastapi uvicorn websockets

# Configurar tu llave de API obtenida en https://aistudio.google.com/apikey
export GEMINI_API_KEY="TU_LLAVE_AQUI"
```

---

## Cómo Navegar y Estudiar este Repositorio

1. **Sigue el orden secuencial**: Cada módulo construye sobre los componentes del anterior para dar forma al proyecto final **AI Product Studio & Copiloto Multimodal en Vivo**.
2. **Ejecuta los ejemplos bilingües (Python y TypeScript)**: Todos los conceptos clave incluyen implementaciones listas para copiar, pegar y ejecutar tanto en Python como en Node.js/TypeScript.
3. **Valida tu aprendizaje**: Al final de cada módulo encontrarás un **Cuestionario de Autoevaluación** con respuestas detalladas desplegables para comprobar tu dominio técnico antes de avanzar.
4. **Consulta la bibliografía oficial**: Cada módulo cierra con enlaces directos y verificados a la documentación oficial pública.

---

## Referencias Públicas Verificadas y Documentación Oficial

- [Google AI Studio — Portal Principal](https://aistudio.google.com)
- [Documentación Oficial de la API de Gemini](https://ai.google.dev/gemini-api/docs)
- [SDK Oficial de Google Gen AI para Python (`google-genai`)](https://github.com/googleapis/python-genai)
- [SDK Oficial de Google Gen AI para TypeScript/JS (`@google/genai`)](https://github.com/googleapis/js-genai)
- [Google Antigravity — Plataforma y SDK de Agentes](https://antigravity.google)
- [Documentación de Google Cloud Run](https://cloud.google.com/run/docs)
