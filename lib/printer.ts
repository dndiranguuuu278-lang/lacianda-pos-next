'use client';

import { buildReceiptEscPos, type ReceiptData } from './receipt';

const CANDIDATE_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // common ESC/POS serial service
  '49535343-fe7d-4ae5-8fa9-9fafd205e455' // ISSC/generic UART service (some clones)
];

let device: any = null;
let characteristic: any = null;

export async function pairPrinter(): Promise<string> {
  if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
    throw new Error('Web Bluetooth is not supported on this browser/device');
  }
  device = await (navigator as any).bluetooth.requestDevice({
    filters: [{ services: CANDIDATE_SERVICES }],
    optionalServices: CANDIDATE_SERVICES
  });
  const server = await device.gatt.connect();

  let service = null;
  for (const uuid of CANDIDATE_SERVICES) {
    try {
      service = await server.getPrimaryService(uuid);
      break;
    } catch {
      /* try next */
    }
  }
  if (!service) throw new Error('No known ESC/POS service found on this printer');

  const characteristics = await service.getCharacteristics();
  characteristic = characteristics.find((c: any) => c.properties.write || c.properties.writeWithoutResponse);
  if (!characteristic) throw new Error('No writable characteristic found on printer service');

  localStorage.setItem('lacianda_printer_name', device.name || 'Thermal printer');
  return device.name;
}

export function isPrinterPaired(): boolean {
  return !!characteristic && !!device?.gatt?.connected;
}

export function pairedPrinterName(): string | null {
  return typeof window === 'undefined' ? null : localStorage.getItem('lacianda_printer_name');
}

async function writeBytes(bytes: Uint8Array) {
  if (!characteristic) throw new Error('Printer not paired');
  const CHUNK = 180; // most BLE stacks cap writes around 180-512 bytes
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const chunk = bytes.slice(i, i + CHUNK);
    if (characteristic.properties.writeWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValue(chunk);
    }
  }
}

export async function printReceipt(data: ReceiptData, width: 58 | 80 = 80) {
  const bytes = buildReceiptEscPos(data, width);
  await writeBytes(bytes);
}
