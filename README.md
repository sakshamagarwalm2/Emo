# EMO — Minimalist Offline AI Desk Assistant & Agent Monitor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Android%20%28React%20Native%29-green.svg)](#1-target-hardware--platform)
[![AI Runtime](https://img.shields.io/badge/AI%20Runtime-llama.rn%20%2F%20GGUF-blue.svg)](#4-local-offline-ai-inference)

**EMO** is a lightweight, always-on landscape desk companion and offline AI agent monitor built with React Native (Bare CLI, TypeScript) targeting mobile hardware such as the **Redmi K20 Pro (Snapdragon 855)**. 

EMO operates as a dedicated desk display featuring procedural minimalist digital eyes, OLED ambient clock displays, local GGUF tiny LLM execution (`llama.rn`), and a local WebSocket listener to receive real-time notifications from external AI agents.

---

## 1. Target Hardware & Platform
- **Target Device:** Redmi K20 Pro (Snapdragon 855, 6GB+ RAM) connected via USB with ADB debugging enabled.
- **OS:** Android 10+ (API Level 29+).
- **Form Factor:** Always-on landscape desk display (`sensorLandscape`, `keepScreenOn`, `WAKE_LOCK`).
- **Development Environment:** Pure command-line setup (Node.js LTS, JDK 17, Android SDK `cmdline-tools`, `adb`, Gradle wrapper). **Android Studio IDE is NOT required.**

---

## 2. Core Features & Modes

### 1. Standby Mode (Ambient Display)
- AMOLED burn-in protected high-contrast dark interface (`#000000` background).
- Minimalist landscape digital clock, date, battery status, and active agent task count.
- Idle eye state: subtle procedural blinks (3–6s intervals) and gentle horizontal tracking.

### 2. Agent Monitor Mode (Reactive)
- Listens on a local WebSocket (`ws://0.0.0.0:8080`) for agent status payloads.
- Expressions shift based on agent status:
  - **Working / Thinking:** Pulsing cyan rings or narrowed pupils.
  - **User Input Needed:** Amber alert expression with actionable toast badge.
  - **Success / Done:** Upward crescent happy eyes.
  - **Error:** Red alert eye movement with diagnostic toast.

### 3. On-Device Offline AI Inference
- Integrated via `llama.rn` for local GGUF quantized models (e.g. `Qwen2.5-0.5B-Instruct-Q4_K_M.gguf`, `SmolLM-360M-Instruct.gguf`).
- Executes intent parsing, quick classification, and offline queries directly on Snapdragon 855 CPU/GPU.
- Intent fallback triggers native Android voice intents (`android.intent.action.VOICE_COMMAND`).

---

## 3. Repository Structure

```
EMO/
├── android/                   # Android native build configuration & Gradle wrapper
│   ├── app/
│   │   └── src/main/AndroidManifest.xml  # Permissions & landscape layout configuration
│   └── local.properties       # Auto-generated Android SDK path
├── docs/
│   └── PROJECT_REPORT.md      # In-depth technical report & architecture specification
├── src/
│   ├── components/
│   │   ├── EyeDisplay.tsx     # Procedural SVG/Reanimated eye expressions
│   │   ├── StandbyClock.tsx   # AMOLED desk clock & battery indicator
│   │   └── AgentToast.tsx     # Actionable notification toasts
│   ├── services/
│   │   ├── AgentSocketServer.ts # Local WebSocket server & listener
│   │   └── LocalLLMService.ts   # llama.rn GGUF inference wrapper
│   ├── state/
│   │   └── useEmoStore.ts     # Zustand global store for state machine
│   ├── App.tsx                # Main state routing & UI entry point
│   └── index.ts               # React Native app root
├── package.json               # Root dependencies & build scripts
├── tsconfig.json              # TypeScript configuration
├── LICENSE                    # MIT License
└── README.md                  # Project overview & documentation
```

---

## 4. WebSocket Payload Protocol

External agents (e.g., local AI scripts, background pipelines, CI/CD runners) connect to EMO over WebSocket on port `8080` sending JSON payloads matching this schema:

```json
{
  "agentId": "research-agent-01",
  "status": "waiting_for_input",
  "message": "Waiting for approval to execute database migration",
  "requiresUserAction": true,
  "timestamp": "2026-09-20T09:10:00Z"
}
```

---

## 5. Quick Start & CLI Build Setup

### Prerequisites
1. **Node.js LTS** (v18+)
2. **Java Development Kit (JDK 17)**
3. **Android SDK Command-Line Tools** (`cmdline-tools`, `platform-tools`, `platforms;android-34`, `build-tools;34.0.0`)
4. **ADB Connected Device**:
   ```bash
   adb devices
   ```

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. Build Debug APK via Gradle (CLI)
cd android && ./gradlew assembleDebug && cd ..

# 3. Deploy & Launch on Connected Device via ADB
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.emo/.MainActivity
```

---

## 6. Optimization Principles (Ponytail Rules)
This codebase follows **Ponytail** engineering guidelines:
- **YAGNI:** Zero unrequested abstractions or unnecessary dependencies.
- **Native Platform First:** Direct React Native Reanimated SVG & native Android intents over heavy external animation/AV engines.
- **AMOLED Safety:** Absolute black background `#000000` to eliminate screen burn-in and minimize battery draw.

---

## 7. License
Distributed under the [MIT License](LICENSE). Copyright (c) 2026 sakshamagarwalm2.
