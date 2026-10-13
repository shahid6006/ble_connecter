/**
 * Architecture & Interface Definitions for Future Native Android Bridge.
 * 
 * Provides TypeScript interfaces and documentation detailing how a future
 * Android Companion App (via WebView JavascriptInterface or Web Message Port)
 * would interface with OS-level Bluetooth audio profiles (A2DP, AVRCP, HFP).
 */

export interface NativeAndroidBluetoothBridge {
  /**
   * Check if running inside Android companion app WebView wrapper
   */
  isNativeBridgeAvailable(): boolean;

  /**
   * Trigger native Android Intent for Bluetooth Settings directly
   */
  openNativeBluetoothSettings(): void;

  /**
   * Request native OS-level connection to an already bonded A2DP audio device
   * Note: Requires BLUETOOTH_CONNECT permission (Android 12+) and BluetoothAdapter.getProfileProxy(..., BluetoothProfile.A2DP)
   */
  connectBondedAudioDevice(macAddress: string): Promise<{ success: boolean; message: string }>;

  /**
   * Query bonded (paired) audio headsets from Android BluetoothAdapter
   */
  getBondedAudioDevices(): Promise<Array<{
    name: string;
    address: string;
    bondState: 'BONDED' | 'BONDING' | 'NONE';
    isConnectedA2dp: boolean;
    batteryLevel?: number;
  }>>;

  /**
   * Query active audio routing stream (STREAM_MUSIC)
   */
  getActiveAudioOutput(): Promise<{
    type: 'BLUETOOTH_A2DP' | 'BLUETOOTH_SCO' | 'BUILTIN_SPEAKER' | 'WIRED_HEADSET' | 'USB_AUDIO';
    deviceName: string;
  }>;
}

export const NATIVE_BRIDGE_DOCUMENTATION = {
  title: 'Future Native Android Companion Architecture',
  summary: `Web applications run in an isolated browser sandbox where Web Bluetooth is constrained strictly to BLE GATT peripherals. To achieve direct Classic Bluetooth (BR/EDR) A2DP audio switching and bonded device listing, an Android companion application or Android PWA TWA (Trusted Web Activity) with native extensions can be integrated.`,
  keyAndroidComponents: [
    {
      component: 'android.bluetooth.BluetoothAdapter',
      purpose: 'Enumerate bonded (paired) devices on the student\'s phone without scanning.',
      requiredPermissions: ['android.permission.BLUETOOTH_CONNECT (Android 12+ / API 31+)'],
      webParity: 'Web Bluetooth cannot read OS bonded device list; requires user to pick device each session.'
    },
    {
      component: 'BluetoothProfile.A2DP (Audio Profile Proxy)',
      purpose: 'Connect or disconnect audio streaming channel to the student\'s earbuds.',
      requiredPermissions: ['BLUETOOTH_CONNECT', 'System Audio Routing priority'],
      webParity: 'Not accessible from web browsers. Browsers only receive audio output via standard OS AudioTrack/AudioRecord.'
    },
    {
      component: 'CompanionDeviceManager (CDM)',
      purpose: 'Associates student\'s earbuds with the app without needing coarse/fine location permissions.',
      requiredPermissions: ['Uses AssociationRequest with BluetoothDeviceFilter'],
      webParity: 'Similar concept to Web Bluetooth requestDevice(), but provides background presence detection.'
    },
    {
      component: 'AudioManager.getDevices(GET_DEVICES_OUTPUTS)',
      purpose: 'Inspect active audio routes (AudioDeviceInfo.TYPE_BLUETOOTH_A2DP).',
      requiredPermissions: ['None (standard Android audio query)'],
      webParity: 'Partially supported via navigator.mediaDevices.enumerateDevices(), but labels require mic permission.'
    }
  ],
  securityAndPermissionTruths: [
    'Android does NOT permit arbitrary hijacking: Even with native permissions, an Android app cannot forcibly disconnect an earbud currently streaming from someone else\'s laptop without physical earbud intervention.',
    'Accessibility Services are strictly prohibited by Google Play policy for Bluetooth connection manipulation and do not grant RF-level control.',
    'Earbuds using Bluetooth Multipoint must negotiate handover at the firmware level (e.g. pausing playback on device A to allow audio focus on device B).',
    'Resetting or reclaiming earbuds from an absent phone requires holding the hardware button on the earbud charging case.'
  ]
};
