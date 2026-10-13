import React, { useState } from 'react';
import { Headphones, Sparkles, ChevronRight, Check } from 'lucide-react';
import { Card } from '../common/Card';

interface BrandGuide {
  id: string;
  name: string;
  pairingSteps: string[];
  forceResetSteps: string[];
  multipointNotes: string;
}

export const BRAND_GUIDES: BrandGuide[] = [
  {
    id: 'apple',
    name: 'Apple AirPods & AirPods Pro / Max',
    pairingSteps: [
      'Place both AirPods in their charging case and keep the lid open.',
      'Press and hold the setup button on the back of the case for ~5 seconds.',
      'Wait until the status LED on the front flashes white, indicating pairing mode.',
      'On your Android phone, open Bluetooth settings and tap the AirPods name.',
    ],
    forceResetSteps: [
      'Keep both AirPods in the case with the lid open.',
      'Hold the back setup button for 15 full seconds until the LED flashes amber, then flashes white.',
      'This clears all previous bonding memory (breaking links with dorm laptops and roommate phones).',
    ],
    multipointNotes:
      'AirPods support seamless auto-switching only across Apple iCloud accounts. Between Android and a PC/Mac, manual Bluetooth selection or a case-button tap is required to switch hosts.',
  },
  {
    id: 'sony',
    name: 'Sony WF-1000XM4 / WF-1000XM5 / WH-1000XM5',
    pairingSteps: [
      'In-Ear (WF): Put both earbuds into your ears. Press and hold your fingers on both touch sensors simultaneously for 7 seconds until the voice prompt announces "Bluetooth pairing".',
      'Over-Ear (WH): While powered off, press and hold the Power button for 7 seconds until the blue LED flashes rapidly in pairs.',
      'Alternatively for WF-1000XM5: Place in case, open lid, hold the small case pairing button for 5 seconds until the blue light flashes.',
    ],
    forceResetSteps: [
      'Place earbuds in case, keep lid open. Press and hold the initialization button on the back of the case for about 15 seconds until the indicator flashes orange 4 times, then turns green.',
    ],
    multipointNotes:
      'Sony headphones support 2-device multipoint, but "Connect to 2 devices simultaneously" must be toggled ON in the Sony Headphones Connect app beforehand.',
  },
  {
    id: 'samsung',
    name: 'Samsung Galaxy Buds 2 / Pro / FE',
    pairingSteps: [
      'Put both earbuds into your ears.',
      'Pinch or touch-and-hold the touchpads on both earbuds simultaneously for 3 seconds until continuous beeping sounds play.',
      'Or: Place in case, leave lid open, and touch both earbuds while seated in the case for 3 seconds until the battery light blinks green/red.',
    ],
    forceResetSteps: [
      'Open the Galaxy Wearable app on your phone -> Earbud settings -> Reset -> Tap Reset to confirm factory unpair.',
    ],
    multipointNotes:
      'Seamless earbud switching only operates between Samsung One UI devices. For non-Samsung laptops/phones, you must manually tap Connect in the second device’s Bluetooth settings.',
  },
  {
    id: 'bose',
    name: 'Bose QuietComfort Earbuds & Ultra / QC45',
    pairingSteps: [
      'Earbuds: Place in case with lid open. Press and hold the button inside or on the back of the case until the Bluetooth light slowly blinks blue.',
      'Headphones: Slide the power switch all the way to the Bluetooth symbol and hold it for 3 seconds until voice says "Ready to connect another device".',
    ],
    forceResetSteps: [
      'Place earbuds in case, plug case into USB charger. Press and hold the Bluetooth button for 30 seconds until the LEDs cycle.',
    ],
    multipointNotes:
      'Bose headphones store up to 8 devices and actively connect to 2. Pressing the Bluetooth button cycles through remembered paired devices.',
  },
  {
    id: 'jabra',
    name: 'Jabra Elite 7 / 8 Active / 10',
    pairingSteps: [
      'Remove earbuds from case and ensure they are turned on.',
      'Simultaneously press and hold both the Right and Left physical buttons for 3 seconds until the LEDs flash blue.',
      'Voice prompt will announce "Go to the Bluetooth menu on your mobile device".',
    ],
    forceResetSteps: [
      'Press and hold both buttons for 10 seconds until the LEDs flash purple. Earbuds will restart and clear all stored pairings.',
    ],
    multipointNotes:
      'True multipoint (Advanced Bluetooth Multipoint) is supported out of the box for up to 2 active devices.',
  },
  {
    id: 'soundcore',
    name: 'Anker Soundcore Liberty 4 / Space',
    pairingSteps: [
      'Place earbuds in the charging case and leave the case lid open.',
      'Press and hold the button on the back or bottom of the case for 3 seconds until the LED indicators flash white rapidly.',
    ],
    forceResetSteps: [
      'Keep earbuds in the case with lid open. Press and hold the case button for 10 seconds until the 3 LED indicators flash red 3 times, then flash white.',
    ],
    multipointNotes:
      'Dual connection can be enabled in the Soundcore mobile app under "Dual Connection" settings.',
  },
  {
    id: 'beats',
    name: 'Beats Fit Pro / Studio Buds / Solo',
    pairingSteps: [
      'Place earbuds in the case and keep the lid open.',
      'Press and hold the system button on the case until the indicator light flashes white.',
    ],
    forceResetSteps: [
      'Hold the case system button for 15 seconds until the light flashes red and white.',
    ],
    multipointNotes:
      'Integrates with Android Fast Pair for quick single-tap setup and battery percentage reporting.',
  },
];

interface ManufacturerCheatSheetProps {
  initialBrand?: string;
}

export const ManufacturerCheatSheet: React.FC<ManufacturerCheatSheetProps> = ({
  initialBrand,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    initialBrand || 'sony'
  );

  const currentGuide =
    BRAND_GUIDES.find((g) => g.id === selectedBrandId) || BRAND_GUIDES[0];

  return (
    <Card className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Hardware Pairing & Reset Cheat Sheet</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Manufacturer button combinations to force pairing mode and reclaim your earbuds.
          </p>
        </div>

        {/* Brand Selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {BRAND_GUIDES.map((brand) => (
            <button
              key={brand.id}
              onClick={() => setSelectedBrandId(brand.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedBrandId === brand.id
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-950'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {brand.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Guide Details */}
      <div className="space-y-4">
        <div>
          <h5 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>How to Enter Pairing Mode: {currentGuide.name}</span>
          </h5>
          <ol className="space-y-2 text-xs text-slate-300 pl-2">
            {currentGuide.pairingSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="font-mono text-cyan-400 font-bold shrink-0">{idx + 1}.</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
            Force Factory Reset (Breaks Link with Distant Dorm Laptops)
          </h5>
          <ol className="space-y-1.5 text-xs text-slate-300 pl-1">
            {currentGuide.forceResetSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200">
          <span className="font-semibold text-blue-300">Multipoint Behavior:</span>{' '}
          {currentGuide.multipointNotes}
        </div>
      </div>
    </Card>
  );
};
