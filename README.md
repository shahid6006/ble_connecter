# Library Bluetooth Manager — Advanced PWA

A mobile-first Progressive Web App (PWA) designed for university students to manage their personal Bluetooth earbuds, verify audio routing before studying in quiet library zones, troubleshoot multi-device connection collisions (such as earbuds accidentally connecting to a dorm laptop or roommate's phone), and reconnect when supported.

---

## 🎧 Core Features

- **Runtime Bluetooth Capability Detection:** Probes Web Bluetooth API support, BLE scanning availability, GATT communication, secure context status (HTTPS/localhost), and standalone PWA status.
- **👑 DJ Owner Mode (Exclusive Connection Management):**
  - **Party Speaker Management:** Save preferred party hardware (JBL PartyBox, Sony ULT/SRS, Bose S1 Pro+, UE HYPERBOOM, Marshall Woburn).
  - **Event Protection Occasions:** Tailored threat levels and multipoint rules for *Wedding / Formal Gala* (Critical), *Party & Social* (High), *Presentation & Lecture* (Moderate), and *Silent Disco / Auracast* (Low).
  - **Exclusive Connection Status Indicator:** Verifies lock levels (`firmware_locked`, `monitoring`, `os_priority`, `unlocked`) with honest boundaries.
  - **Live Interruption Alerts:** Interruption watcher tracking dropped telemetry, audio focus loss, and multipoint polling.
  - **Speaker Pairing Security & Hardware Lock:** Step-by-step physical button commands and companion app multipoint toggles.
  - **Manufacturer SDK & Native Android Bridge Spec:** Documents Harman JBL Portable SDK, Sony Music Center API, Android `BluetoothA2dp.setActiveDevice()`, and LE Audio Auracast broadcast streams.
- **Strict Protocol Distinction:** Clearly differentiates between:
  1. Bluetooth Device Discovery (User-initiated native browser chooser)
  2. BLE GATT Connectivity (Battery Level, Device Information, Serial characteristics)
  3. Classic Bluetooth Audio Connectivity (BR/EDR, A2DP)
  4. Operating-System Bluetooth Pairing & Link Keys
  5. A2DP Audio Playback Routing (OS audio stack)
  6. AVRCP Media-Control Functionality (Media Session API)
- **Truthful Architecture (No Fakes):** Never simulates fake devices, fake MAC addresses, fake RSSI signals, or fabricated connection success.
- **Silent Library Audio Routing Probe:** Volume-guarded stereo ping (Left / Right / Center binaural chime) with Web Audio API and Media Session API integration to safely verify that sound is playing through earbuds rather than bursting out of the phone's speakers in a silent study room.
- **Preferred Device Manager:** Persist primary earbuds in IndexedDB, assign personal nicknames, track dorm laptop connection notes, and configure study reminders.
- **Reconnection Engine with Backoff:** Robust state machine (`idle`, `discovering`, `connecting`, `connected`, `disconnected`, `unsupported`, `permission-denied`, `error`) with exponential backoff (1s, 2s, 4s, 8s, 10s) and cancellation controls.
- **Library Troubleshooting Assistant:** Step-by-step guides for dorm laptop interference, multipoint connection stalls, and manufacturer hardware reset combinations (Apple, Sony, Samsung, Bose, Jabra, Anker Soundcore, Beats).
- **Direct System Settings Shortcuts:** Deep link intent for Android Bluetooth Settings (`intent:#Intent;action=android.settings.BLUETOOTH_SETTINGS;end`) with desktop shortcuts.
- **Full PWA Compliance:** Web App Manifest, Service Worker caching for offline app shell, and in-app install prompt.

---

## 📱 Browser & Platform Compatibility Table

| Platform / Browser | Web Bluetooth Support | BLE GATT Connection | Classic A2DP Audio Control | PWA Installable |
| :--- | :--- | :--- | :--- | :--- |
| **Android — Google Chrome** | ✅ Full Support | ✅ Full Support | ⚠️ OS Settings Only | ✅ Yes (`beforeinstallprompt`) |
| **Android — Samsung Internet** | ✅ Full Support | ✅ Full Support | ⚠️ OS Settings Only | ✅ Yes |
| **ChromeOS — Chrome** | ✅ Full Support | ✅ Full Support | ⚠️ OS Settings Only | ✅ Yes |
| **Windows / macOS — Google Chrome** | ✅ Full Support | ✅ Full Support | ⚠️ OS Settings Only | ✅ Yes |
| **Windows / macOS — Microsoft Edge** | ✅ Full Support | ✅ Full Support | ⚠️ OS Settings Only | ✅ Yes |
| **iOS / iPadOS — Safari (WebKit)** | ❌ Blocked by Apple | ❌ Blocked by Apple | ⚠️ OS Settings Only | ✅ Yes (Manual Add to Home Screen) |
| **Any — Mozilla Firefox** | ❌ Disabled by Mozilla | ❌ Disabled by Mozilla | ⚠️ OS Settings Only | ⚠️ Partial |

---

## 🔒 Security, Privacy & Browser Limitations

1. **BLE vs Classic Audio Distinction:** The W3C Web Bluetooth standard only grants web applications access to Bluetooth Low Energy (BLE) Generic Attribute Profile (GATT) peripherals. Classic Bluetooth audio streams (A2DP / AVRCP) and phone-to-earbud link keys are strictly held in the OS kernel.
2. **No Remote Disconnect or Hijacking:** A web page cannot remotely hijack an earbud connection or force-disconnect someone else's phone without access to that device or physical earbud button controls.
3. **User Gesture Requirement:** Browsers require an explicit user click or tap to open the device chooser. Silent background scanning is restricted by modern browsers.
4. **100% On-Device Storage:** All preferences and diagnostic logs remain exclusively inside your device's browser IndexedDB sandbox. Zero telemetry or personal information is transmitted to external servers.

---

## 🤖 Future Native Android Companion Architecture

For environments requiring direct Classic Bluetooth audio routing and bonded device enumeration, an Android Companion app or Trusted Web Activity (TWA) bridge can be integrated using the interfaces documented in `src/services/android/nativeBridgeDocs.ts`:

- `android.bluetooth.BluetoothAdapter`: Enumerates OS bonded devices without scanning.
- `BluetoothProfile.A2DP`: Queries and requests active A2DP audio streams (requires `android.permission.BLUETOOTH_CONNECT` on Android 12+).
- `CompanionDeviceManager (CDM)`: Associates earbuds without requiring continuous location permissions.
- `AudioManager`: Inspects active audio routes (`AudioDeviceInfo.TYPE_BLUETOOTH_A2DP`).

---

## 🚀 Development & Testing

### Prerequisites
- Node.js 18+
- npm 9+

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### Run Automated Tests
```bash
npm test
```
Executes the Vitest unit test suite covering capability detection, state transitions, storage persistence, and PWA install hooks.

### Production Build
```bash
npm run build
```

---

## 🌐 Deployment to Free HTTPS Hosting (Vercel / GitHub Pages / Cloudflare)

> **Important:** Web Bluetooth API and Service Workers require a secure HTTPS origin (`window.isSecureContext === true`).

### Deploying to Vercel
1. Push your repository to GitHub.
2. Import the repository in [Vercel Dashboard](https://vercel.com).
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Click **Deploy**. Vercel automatically provisions SSL/HTTPS.

### Deploying to GitHub Pages
1. In `vite.config.ts`, set `base: '/<repo-name>/'` if hosting on a project path.
2. Build the project: `npm run build`.
3. Deploy the `dist` directory using `gh-pages` or GitHub Actions workflow with HTTPS enabled.

---

## 📄 License
Apache-2.0
