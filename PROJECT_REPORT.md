# PROJECT REPORT & TECHNICAL SPECIFICATION: PROJECT EMO

**Project Name:** EMO (Emotive Minimalist Offline AI Desk Assistant & Agent Monitor)  
**Author / Maintainer:** sakshamagarwalm2  
**Target Hardware:** Qualcomm Snapdragon 855 / 6GB+ RAM (Redmi K20 Pro)  
**Target Platform:** Android 10+ (API Level 29+)  
**Framework:** React Native 0.74+ (Bare TypeScript CLI, No Expo, No Android Studio GUI Required)  
**License:** MIT License  

---

## 1. Executive Summary

Project **EMO** is designed to repurpose mobile hardware (specifically the Snapdragon 855 platform found in the Redmi K20 Pro) into an always-on, minimalist offline AI desk assistant and agent status display. Rather than employing resource-heavy 3D avatars or complex graphics rendering pipelines, EMO utilizes procedural vector-based digital eyes and crisp typography to communicate emotional state, system health, and agent status.

Key architectural goals include:
1. **Headless Build Capability:** Fully operable and buildable using command-line tools (Node.js, JDK 17, Android `cmdline-tools`, `gradlew`, and `adb`), eliminating the need for Android Studio IDE.
2. **Offline Local Inference:** Native execution of 0.5B to 1.5B parameter GGUF models on mobile hardware via `llama.rn` (CPU/GPU acceleration).
3. **Reactive Agent Monitoring:** Built-in WebSocket server to accept events from background agent workflows (e.g. Antigravity agents, dev scripts, CI pipelines) and convert them into immediate visual feedback.
4. **AMOLED Hardware Longevity:** Strict `#000000` dark mode with pixel shift protection to enable continuous plugged-in desk operation without burn-in or overheating.

---

## 2. Hardware Performance & Target Profile

### Qualcomm Snapdragon 855 Specifications
- **CPU:** Kryo 485 Octa-core (1x 2.84 GHz Prime + 3x 2.42 GHz Performance + 4x 1.80 GHz Efficiency).
- **GPU:** Adreno 640.
- **NPU / DSP:** Hexagon 690.
- **Memory:** 6GB LPDDR4X RAM.

### Model Benchmarks & Allocation Strategy
For sub-second to 2-second response latency on Snapdragon 855:
- **Recommended Models:**
  - `Qwen2.5-0.5B-Instruct-Q4_K_M.gguf` (~390 MB RAM footprint)
  - `SmolLM-360M-Instruct-Q4_K_M.gguf` (~290 MB RAM footprint)
- **Inference Speed:** ~15–25 tokens/sec on Kryo 485 CPU cores via `llama.rn` (OpenCL/CPU backends).
- **RAM Overhead:** ~1.2 GB total app footprint (React Native runtime + llama.rn context buffer + UI state).

---

## 3. Architecture & Data Flow

```
                                    +-----------------------------------+
                                    |     External AI / Dev Agents      |
                                    +-----------------------------------+
                                                      |
                                           WebSocket JSON Payload
                                           (ws://0.0.0.0:8080)
                                                      |
                                                      v
+-----------------------------------------------------------------------------------+
| EMO React Native Runtime                                                          |
|                                                                                   |
|  +---------------------------+       +-----------------------------------------+  |
|  |   AgentSocketServer.ts    | ----> |            useEmoStore (Zustand)        |  |
|  +---------------------------+       +-----------------------------------------+  |
|                                                           |                       |
|                                       +-------------------+-------------------+   |
|                                       |                                       |   |
|                                       v                                       v   |
|                      +----------------------------------+   +-------------------+ |
|                      |         EyeDisplay.tsx           |   | StandbyClock.tsx  | |
|                      |  (SVG / Reanimated State Machine) |   | (OLED Dark Mode)  | |
|                      +----------------------------------+   +-------------------+ |
|                                                                                   |
|  +---------------------------+                                                    |
|  |     LocalLLMService       | <--- llama.rn (Qwen 0.5B / SmolLM 360M GGUF)       |
|  +---------------------------+                                                    |
+-----------------------------------------------------------------------------------+
```

---

## 4. Emotional Eye Animation Engine

The UI centerpiece is `EyeDisplay.tsx`, a vector eye display driven by `react-native-reanimated` and `react-native-svg`.

### State Machine Expressions
| State | Visual Behavior | Trigger Event |
|-------|-----------------|---------------|
| **IDLE** | Normal oval pupils, periodic blinks (3-6s), slight horizontal lookarounds | Default standby mode |
| **THINKING** | Narrowed oval pupils, pulsing cyan outline (`#00E5FF`) | Agent status: `"working"` or local LLM processing |
| **ALERT** | Widened circular pupils, amber accent ring (`#FFAB00`), soft vibration | Agent status: `"waiting_for_input"` (Requires user action) |
| **HAPPY** | Upward crescent arc eyes, gentle bounce | Agent status: `"done"` / task completed |
| **ERROR** | Narrowed sharp angle eyes, crimson glow (`#FF5252`) | Agent status: `"error"` / build or pipeline failure |

---

## 5. Standby Display & Hardware Safety Controls

### AMOLED Burn-In Prevention
- **True Black Background:** `#000000` turns off pixels on OLED/AMOLED displays (Redmi K20 Pro features an AMOLED panel).
- **Pixel Shift Mechanism:** Micro-shifts UI elements by 1–2 pixels every 60 seconds to prevent static image retention.
- **Always-On Screen Keep-Awake:** Uses native `KEEP_SCREEN_ON` window flag and `WAKE_LOCK` permission without turning off the display while connected to USB power.

---

## 6. Socket Protocol Specification

The local WebSocket server binds to `0.0.0.0:8080`. External applications communicate with EMO using structured JSON messages.

### Incoming Event Schema
```typescript
interface AgentEventPayload {
  agentId: string;
  status: 'idle' | 'working' | 'waiting_for_input' | 'done' | 'error';
  message: string;
  requiresUserAction?: boolean;
  timestamp?: string;
}
```

### Response / Ack Schema
```typescript
interface EmoAckResponse {
  received: boolean;
  currentMode: 'standby' | 'active';
  activeAgentCount: number;
}
```

---

## 7. Headless Command-Line Build & Deployment Pipeline

EMO is designed to be fully built and deployed without opening an IDE.

### Step 1: Environment Setup
Ensure standard CLI variables are set in environment:
```powershell
$env:ANDROID_HOME = "C:\Users\SAKSHAM\AppData\Local\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
```

### Step 2: Build Debug APK
```bash
cd android
./gradlew assembleDebug
```

### Step 3: Deployment via ADB
```bash
# Check device state
adb devices

# Install APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Launch MainActivity in Landscape Mode
adb shell am start -n com.emo/.MainActivity
```

---

## 8. Development Roadmap

- [x] Technical Architecture & System Specification
- [x] Repository Baseline & Documentation Setup
- [ ] React Native Core Structure & TypeScript Configuration
- [ ] SVG / Reanimated Procedural Eye Component (`EyeDisplay.tsx`)
- [ ] Standby OLED Clock Component (`StandbyClock.tsx`)
- [ ] Local WebSocket Agent Listener (`AgentSocketServer.ts`)
- [ ] `llama.rn` Local GGUF Model Runtime Wrapper (`LocalLLMService.ts`)
- [ ] Gradle & ADB Deployment Validation on Device

---

## 9. Conclusion

Project EMO delivers an efficient, low-overhead desk companion that converts an idle smartphone into a smart AI agent dashboard. By leveraging native React Native execution and local GGUF models, EMO provides real-time ambient feedback without relying on cloud services or heavy IDE dependencies.
