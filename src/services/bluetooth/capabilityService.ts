import { BluetoothCapabilities, BluetoothAvailability } from '../../types/bluetooth';

export class BluetoothCapabilityService {
  /**
   * Evaluates runtime browser and platform Bluetooth capabilities.
   */
  async detectCapabilities(): Promise<BluetoothCapabilities> {
    const isClient = typeof window !== 'undefined';
    const nav = isClient ? (navigator as any) : null;

    const webBluetoothSupported = !!(nav && 'bluetooth' in nav);
    const secureContext = isClient ? Boolean(window.isSecureContext) : false;

    // Detect standalone PWA
    const isStandalonePWA = isClient
      ? (typeof window.matchMedia === 'function' &&
          window.matchMedia('(display-mode: standalone)').matches) ||
        Boolean((nav as any)?.standalone)
      : false;

    const browserInfo = this.detectBrowserAndOS();

    let scanningSupported = false;
    let gattSupported = webBluetoothSupported;
    let availability: BluetoothAvailability = 'unknown';

    if (webBluetoothSupported && nav.bluetooth) {
      scanningSupported = typeof nav.bluetooth.requestLEScan === 'function';

      if (typeof nav.bluetooth.getAvailability === 'function') {
        try {
          const isAvailable = await nav.bluetooth.getAvailability();
          availability = isAvailable ? 'available' : 'unavailable';
        } catch {
          availability = 'unknown';
        }
      } else {
        availability = 'available';
      }
    } else {
      availability = 'unsupported';
      gattSupported = false;
    }

    const restrictions: string[] = [];
    const reasons: string[] = [];

    if (!secureContext) {
      restrictions.push('Insecure Context (Requires HTTPS or localhost)');
      reasons.push('Web Bluetooth API is strictly blocked on unencrypted HTTP connections.');
    }

    if (!webBluetoothSupported) {
      if (browserInfo.os === 'iOS') {
        restrictions.push('iOS WebKit Limitation');
        reasons.push(
          'Apple WebKit (Safari, Chrome on iOS, Firefox on iOS) does not support Web Bluetooth due to system sandboxing restrictions.'
        );
      } else if (browserInfo.browser === 'Firefox') {
        restrictions.push('Mozilla Firefox Limitation');
        reasons.push('Firefox has not implemented Web Bluetooth due to privacy and fingerprinting concerns.');
      } else {
        restrictions.push('Browser Does Not Support Web Bluetooth');
        reasons.push('Web Bluetooth is supported on Google Chrome, Edge, and Samsung Internet on Android, ChromeOS, macOS, and Windows.');
      }
    } else {
      restrictions.push('BLE GATT Scope Only');
      reasons.push(
        'The Web Bluetooth API can communicate with BLE peripherals and GATT services (like battery or vendor telemetry), but cannot directly hijack or manage Classic Bluetooth (BR/EDR) A2DP audio streams.'
      );

      restrictions.push('User Gesture Required');
      reasons.push('Browsers require a direct user tap/click to open the native device chooser dialog; background or automatic device scanning is blocked.');

      restrictions.push('No Remote Disconnect of Foreign Devices');
      reasons.push(
        'A browser cannot forcibly disconnect a roommate or classmate’s phone from your earbuds. Physical case button or the owner’s phone is required.'
      );
    }

    return {
      webBluetoothSupported,
      scanningSupported,
      gattSupported,
      secureContext,
      isStandalonePWA,
      browserName: browserInfo.browser,
      osName: browserInfo.os,
      availability,
      restrictions,
      reasons,
    };
  }

  /**
   * Helper to identify browser name and OS
   */
  private detectBrowserAndOS(): { browser: string; os: string } {
    if (typeof window === 'undefined') {
      return { browser: 'Unknown', os: 'Unknown' };
    }

    const ua = navigator.userAgent;
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    // OS detection
    if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/windows/i.test(ua)) os = 'Windows';
    else if (/cros/i.test(ua)) os = 'ChromeOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    // Browser detection
    if (/samsungbrowser/i.test(ua)) browser = 'Samsung Internet';
    else if (/edg/i.test(ua)) browser = 'Microsoft Edge';
    else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/opera|opr/i.test(ua)) browser = 'Opera';

    return { browser, os };
  }
}

export const capabilityService = new BluetoothCapabilityService();
