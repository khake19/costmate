/**
 * This module is responsible on handling all the inter process communications 
 * between the frontend to the electron backend.
 */

import { app, ipcMain, BrowserWindow } from 'electron';
import { createPublicKey, verify } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { environment } from '../../environments/environment';

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEA/RxppmlSQHHjr54MTsTOHlmt7erIO+aWjZydmC1SI8E=
-----END PUBLIC KEY-----`;

function getLicensePath() {
  return join(app.getPath('userData'), 'license.json');
}

function parseLicenseKey(key: string): { buyerInfo: string; signature: Buffer } | null {
  if (!key.startsWith('COSTMATE-')) return null;
  const payload = key.slice('COSTMATE-'.length);
  const dotIndex = payload.indexOf('.');
  if (dotIndex === -1) return null;
  const buyerInfoB64 = payload.slice(0, dotIndex);
  const signatureB64 = payload.slice(dotIndex + 1);
  try {
    return {
      buyerInfo: Buffer.from(buyerInfoB64, 'base64').toString('utf-8'),
      signature: Buffer.from(signatureB64, 'base64'),
    };
  } catch {
    return null;
  }
}

function verifyLicense(key: string): { valid: boolean; buyerInfo?: string } {
  const parsed = parseLicenseKey(key);
  if (!parsed) return { valid: false };
  const publicKey = createPublicKey(PUBLIC_KEY_PEM);
  const isValid = verify(null, Buffer.from(parsed.buyerInfo), publicKey, parsed.signature);
  return isValid ? { valid: true, buyerInfo: parsed.buyerInfo } : { valid: false };
}

export default class ElectronEvents {
    static bootstrapElectronEvents(): Electron.IpcMain {
        return ipcMain;
    }
}

// Retrieve app version
ipcMain.handle('get-app-version', (event) => {
    console.log(`Fetching application version... [v${environment.version}]`);

    return environment.version;
});

// Handle App termination
ipcMain.on('quit', (event, code) => {
    app.exit(code);
});

// Window controls
ipcMain.on('window-minimize', () => {
    BrowserWindow.getFocusedWindow()?.minimize();
});

ipcMain.on('window-maximize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win?.isMaximized()) {
        win.unmaximize();
    } else {
        win?.maximize();
    }
});

ipcMain.on('window-close', () => {
    BrowserWindow.getFocusedWindow()?.close();
});

// License validation
ipcMain.handle('validate-license', (_event, key: string) => {
    const result = verifyLicense(key);
    if (result.valid) {
        const licensePath = getLicensePath();
        writeFileSync(licensePath, JSON.stringify({ key, buyerInfo: result.buyerInfo }), 'utf-8');
    }
    return result;
});

ipcMain.handle('check-license', () => {
    const licensePath = getLicensePath();
    if (!existsSync(licensePath)) return { activated: false };
    try {
        const data = JSON.parse(readFileSync(licensePath, 'utf-8'));
        const result = verifyLicense(data.key);
        return { activated: result.valid, buyerInfo: result.buyerInfo };
    } catch {
        return { activated: false };
    }
});

ipcMain.handle('get-license-info', () => {
    const licensePath = getLicensePath();
    if (!existsSync(licensePath)) return null;
    try {
        const data = JSON.parse(readFileSync(licensePath, 'utf-8'));
        return { buyerInfo: data.buyerInfo };
    } catch {
        return null;
    }
});