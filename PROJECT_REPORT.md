# PROJECT REPORT & TECHNICAL SPECIFICATION: PROJECT EMO

**Project Name:** EMO (Emotive Minimalist Offline AI Desk Assistant & Agent Monitor)  
**Author / Maintainer:** sakshamagarwalm2  
**Target Hardware:** Universal Android Smartphones (Snapdragon 855/845/700-series, Helio, Exynos, Tensor, 4GB+ RAM)  
**Target Platform:** Android 10+ (API Level 29+)  
**Framework:** React Native 0.74+ (Bare TypeScript CLI, No Expo, No Android Studio GUI Required)  
**License:** MIT License  

---

## 1. Executive Summary

Project **EMO** is designed to repurpose **any spare or older Android smartphone** into an always-on, minimalist offline AI desk assistant and agent status display. Rather than discarding older devices or employing resource-heavy 3D avatar rendering engines, EMO utilizes procedural vector-based digital eyes and crisp typography to communicate emotional state, system health, and agent status.

Key architectural goals include:
1. **Universal Android Hardware Reuse:** Compatible with any Android 10+ phone (e.g. Redmi K20 Pro, Pixel 3/4/5, OnePlus 6/7/8, Samsung S9/S10, Poco F1, etc.).
2. **Headless Build Capability:** Fully operable and buildable using command-line tools (Node.js, JDK 17, Android `cmdline-tools`, `gradlew`, and `adb`), eliminating the need for Android Studio IDE.
3. **In-App Offline Local Inference Setup:** Built-in model downloading directly inside the app (fetching tiny GGUF quantized LLMs such as `Qwen2.5-0.5B` or `SmolLM-360M` from HuggingFace) with zero manual PC file transfers required.
4. **Reactive Agent Monitoring:** Built-in WebSocket server to accept events from background agent workflows (e.g. Antigravity agents, dev scripts, CI pipelines) and convert them into immediate visual feedback.
5. **AMOLED Hardware Longevity:** Strict `#000000` dark mode with pixel shift protection to enable continuous plugged-in desk operation without burn-in or overheating.

---

## 2. Universal Hardware Performance Profile

### Processor Categories & Inference Benchmarks
| Hardware Class | Typical SoC Examples | RAM | Target Model | Est. Speed (Tokens/sec) |
|----------------|----------------------|-----|--------------|-------------------------|
| **Flagship (Prev Gen)** | Snapdragon 855 / 865, Exynos 990, Tensor G1 | 6GB-8GB | Qwen2.5-0.5B Q4_K_M | 15–25 t/s |
| **Mid-Range / Older** | Snapdragon 845 / 765G / 720G, Helio G90T | 4GB-6GB | SmolLM-360M Q4_K_M | 10–20 t/s |
| **Entry-Level Repurposed** | Snapdragon 665 / 675 / 680 | 4GB | SmolLM-360M Q4_K_M | 6–12 t/s |

---

## 3. In-App Model Setup & Automated Downloader

EMO manages offline AI models completely in-app via `LocalLLMService.ts`:
1. **Auto Detection:** Checks local device storage (`/data/user/0/com.emo/files/models/` or external app storage) for existing `.gguf` files.
2. **HuggingFace Direct Download:** If no model is found, user can tap "Download Local Model" in-app. The app fetches the 300MB–400MB GGUF binary directly over HTTPS.
3. **Context Initialization:** Automatically initializes `llama.rn` context upon download completion.

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
- **True Black Background:** `#000000` turns off pixels on OLED/AMOLED displays.
- **Pixel Shift Mechanism:** Micro-shifts UI elements by 1–2 pixels every 60 seconds to prevent static image retention.
- **Always-On Screen Keep-Awake:** Uses native `KEEP_SCREEN_ON` window flag and `WAKE_LOCK` permission without turning off the display while connected to USB power.

---

## 6. Socket Protocol Specification

The local WebSocket server binds to `0.0.0.0:8080`. External applications communicate with EMO using structured JSON messages.

```typescript
interface AgentEventPayload {
  agentId: string;
  status: 'idle' | 'working' | 'waiting_for_input' | 'done' | 'error';
  message: string;
  requiresUserAction?: boolean;
  timestamp?: string;
}
```

---

## 7. Headless Command-Line Build & Deployment Pipeline

EMO is designed to be fully built and deployed without opening an IDE.

```bash
# 1. Build Debug APK
cd android && ./gradlew assembleDebug && cd ..

# 2. Deploy via ADB
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.emo/.MainActivity
```
