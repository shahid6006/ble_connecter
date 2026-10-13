/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Navigation, NavTab } from './components/common/Navigation';
import { StatusHero } from './components/dashboard/StatusHero';
import { QuickActions } from './components/dashboard/QuickActions';
import { VerifiedAudioCard } from './components/dashboard/VerifiedAudioCard';
import { ProtocolDistinctionCard } from './components/dashboard/ProtocolDistinctionCard';
import { DeviceScanner } from './components/discovery/DeviceScanner';
import { PreferredDeviceList } from './components/preferred/PreferredDeviceList';
import { LiveMonitor } from './components/monitor/LiveMonitor';
import { TroubleshootGuide } from './components/troubleshoot/TroubleshootGuide';
import { SettingsView } from './components/settings/SettingsView';
import { DJOwnerModeView } from './components/dj/DJOwnerModeView';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { NoticeBanner } from './components/common/NoticeBanner';

import { useBluetoothCapabilities } from './hooks/useBluetoothCapabilities';
import { useBluetoothConnection } from './hooks/useBluetoothConnection';
import { usePreferredDevices } from './hooks/usePreferredDevices';
import { usePWAInstall } from './hooks/usePWAInstall';
import { storageService, DEFAULT_SETTINGS, AppSettings } from './services/storage/indexedDbService';
import { audioVerifier } from './services/bluetooth/audioVerifier';
import { DiscoveredGattDevice, PreferredDeviceRecord } from './types/bluetooth';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [troubleshootBrandTarget, setTroubleshootBrandTarget] = useState<string | undefined>();
  const [bannerAlert, setBannerAlert] = useState<{ type: 'info' | 'warning' | 'success'; message: string } | null>(null);

  // Core Hooks
  const { capabilities, refresh: refreshCapabilities } = useBluetoothCapabilities();
  const {
    status,
    devices,
    discoverDevices,
    connectGatt,
    cancelOperation,
    disconnect,
  } = useBluetoothConnection();
  const {
    preferredDevices,
    saveDevice,
    removeDevice,
    updateLastConnected,
  } = usePreferredDevices();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Load Settings and Register Service Worker
  useEffect(() => {
    storageService.getSettings().then(setSettings);

    // Register PWA Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((reg) => {
            console.log('PWA ServiceWorker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('ServiceWorker registration error:', err);
          });
      });
    }

    // Sync from URL hash
    const hash = window.location.hash.replace('#', '') as NavTab;
    if (['dashboard', 'discovery', 'preferred', 'dj', 'monitor', 'troubleshoot', 'settings'].includes(hash)) {
      setCurrentTab(hash);
    }
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateSettings = async (partial: Partial<AppSettings>) => {
    const updated = await storageService.saveSettings(partial);
    setSettings(updated);
  };

  const handleClearAllData = async () => {
    await storageService.clearAllData();
    setSettings(DEFAULT_SETTINGS);
    window.location.reload();
  };

  // Find primary device from preferred list
  const primaryDevice = preferredDevices.length > 0 ? preferredDevices[0] : null;
  const activeGattDevice = devices.find((d) => d.connected) || devices[0] || null;
  const preferredIds = new Set(preferredDevices.map((d) => d.id));

  const handleSaveFromDiscovery = async (device: DiscoveredGattDevice) => {
    const newRecord: PreferredDeviceRecord = {
      id: device.id,
      name: device.name,
      nickname: device.name,
      brand: device.name.toLowerCase().includes('sony')
        ? 'sony'
        : device.name.toLowerCase().includes('airpods')
        ? 'apple'
        : device.name.toLowerCase().includes('buds')
        ? 'samsung'
        : device.name.toLowerCase().includes('bose')
        ? 'bose'
        : 'other',
      deviceCategory: device.category,
      multipointEnabled: true,
      createdAt: Date.now(),
      lastConnectedAt: device.lastConnectedAt || null,
      reconnectReminder: true,
    };
    await saveDevice(newRecord);
    setBannerAlert({
      type: 'success',
      message: `Saved "${device.name}" to Preferred Audio Devices.`,
    });
  };

  const handleConnectPrimary = async () => {
    if (!primaryDevice) return;
    const known = devices.find((d) => d.id === primaryDevice.id);
    if (known) {
      await connectGatt(known.id);
      await updateLastConnected(primaryDevice.id);
    } else {
      // Prompt user to select in native chooser
      const picked = await discoverDevices();
      if (picked) {
        await connectGatt(picked.id);
        await updateLastConnected(primaryDevice.id);
      }
    }
  };

  const handleOpenTroubleshootWithBrand = (brand: string) => {
    setTroubleshootBrandTarget(brand);
    handleSelectTab('troubleshoot');
  };

  const handleQuickSoundCheck = async () => {
    handleSelectTab('monitor');
    await audioVerifier.playTestTone('both', settings.volumeGuardLimit);
  };

  // Theme wrapper styling
  const themeClasses = {
    dark: 'bg-slate-950 text-slate-100',
    midnight: 'bg-black text-slate-100',
    light: 'bg-slate-100 text-slate-900',
  }[settings.theme];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${themeClasses}`}>
      {/* Header */}
      <Header
        status={status}
        capabilities={capabilities}
        onRefreshCapabilities={refreshCapabilities}
        onOpenSettings={() => handleSelectTab('settings')}
        isInstallable={isInstallable}
        onInstall={install}
        isInstalled={isInstalled}
      />

      {/* Navigation Bar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        preferredCount={preferredDevices.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 md:py-8 space-y-6 pb-24 md:pb-12">
        {bannerAlert && (
          <NoticeBanner
            type={bannerAlert.type}
            message={bannerAlert.message}
            onDismiss={() => setBannerAlert(null)}
          />
        )}

        {/* Tab 1: Dashboard */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            <StatusHero
              status={status}
              capabilities={capabilities}
              primaryDevice={primaryDevice}
              activeGattDevice={activeGattDevice}
              onDiscover={discoverDevices}
              onConnectPrimary={handleConnectPrimary}
              onCancel={cancelOperation}
              onNavigateToTab={handleSelectTab}
            />

            <QuickActions
              onDiscover={discoverDevices}
              onNavigateToTab={handleSelectTab}
              onQuickSoundCheck={handleQuickSoundCheck}
            />

            <VerifiedAudioCard
              volumePercent={settings.volumeGuardLimit}
              onVolumeChange={(val) => handleUpdateSettings({ volumeGuardLimit: val })}
            />

            <ProtocolDistinctionCard />
          </div>
        )}

        {/* Tab 2: Discovery */}
        {currentTab === 'discovery' && (
          <DeviceScanner
            status={status}
            capabilities={capabilities}
            devices={devices}
            onDiscover={discoverDevices}
            onConnect={connectGatt}
            onDisconnect={disconnect}
            onSavePreferred={handleSaveFromDiscovery}
            preferredIds={preferredIds}
          />
        )}

        {/* Tab 3: Preferred Devices */}
        {currentTab === 'preferred' && (
          <PreferredDeviceList
            devices={preferredDevices}
            onSaveDevice={saveDevice}
            onRemoveDevice={removeDevice}
            onConnectDevice={async (dev) => {
              const known = devices.find((d) => d.id === dev.id);
              if (known) {
                await connectGatt(known.id);
              } else {
                await discoverDevices();
              }
            }}
            onOpenTroubleshoot={handleOpenTroubleshootWithBrand}
          />
        )}

        {/* Tab 4: DJ Owner Mode */}
        {currentTab === 'dj' && (
          <DJOwnerModeView
            status={status}
            capabilities={capabilities}
            discoveredDevices={devices}
            onDiscover={discoverDevices}
            onConnectGatt={connectGatt}
            onDisconnectGatt={disconnect}
          />
        )}

        {/* Tab 5: Sound Check & Live Monitor */}
        {currentTab === 'monitor' && (
          <LiveMonitor
            status={status}
            capabilities={capabilities}
            volumePercent={settings.volumeGuardLimit}
            onVolumeChange={(val) => handleUpdateSettings({ volumeGuardLimit: val })}
            onCancelOperation={cancelOperation}
            onOpenTroubleshoot={() => handleSelectTab('troubleshoot')}
          />
        )}

        {/* Tab 5: Troubleshooting Assistant */}
        {currentTab === 'troubleshoot' && (
          <TroubleshootGuide initialBrand={troubleshootBrandTarget} />
        )}

        {/* Tab 6: Settings */}
        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            capabilities={capabilities}
            onClearData={handleClearAllData}
          />
        )}
      </main>

      {/* Offline Toast */}
      <OfflineIndicator />
    </div>
  );
}
