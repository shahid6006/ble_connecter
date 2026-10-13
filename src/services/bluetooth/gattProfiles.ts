// Standard Bluetooth SIG GATT Services and Characteristics
export const GATT_SERVICES = {
  BATTERY_SERVICE: 'battery_service', // 0x180F
  DEVICE_INFORMATION: 'device_information', // 0x180A
  GENERIC_ACCESS: 'generic_access', // 0x1800
  GENERIC_ATTRIBUTE: 'generic_attribute', // 0x1801
  GOOGLE_FAST_PAIR: 0xfe2c, // Fast Pair Provider
};

export const GATT_CHARACTERISTICS = {
  BATTERY_LEVEL: 'battery_level', // 0x2A19
  MANUFACTURER_NAME_STRING: 'manufacturer_name_string', // 0x2A29
  MODEL_NUMBER_STRING: 'model_number_string', // 0x2A24
  DEVICE_NAME: 'gap.device_name', // 0x2A00
};

export const STANDARD_SERVICES_LIST: Array<string | number> = [
  'battery_service',
  'device_information',
  'generic_access',
];

export function parseBatteryLevel(dataView: DataView): number {
  return dataView.getUint8(0);
}

export function parseStringCharacteristic(dataView: DataView): string {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(dataView);
}

export function inferCategoryFromName(name: string): 'earbuds' | 'headphones' | 'speaker' | 'ble_peripheral' | 'unknown' {
  const lower = name.toLowerCase();
  if (
    lower.includes('buds') ||
    lower.includes('airpods') ||
    lower.includes('ear') ||
    lower.includes('wf-') ||
    lower.includes('linkbuds') ||
    lower.includes('tune') ||
    lower.includes('liberty') ||
    lower.includes('elite')
  ) {
    return 'earbuds';
  }

  if (
    lower.includes('wh-') ||
    lower.includes('quietcomfort') ||
    lower.includes('bose 700') ||
    lower.includes('xm4') ||
    lower.includes('xm5') ||
    lower.includes('headphone') ||
    lower.includes('crusher') ||
    lower.includes('studio') ||
    lower.includes('major')
  ) {
    return 'headphones';
  }

  if (
    lower.includes('soundlink') ||
    lower.includes('flip') ||
    lower.includes('charge') ||
    lower.includes('boom') ||
    lower.includes('speaker') ||
    lower.includes('wonderboom')
  ) {
    return 'speaker';
  }

  return 'ble_peripheral';
}
