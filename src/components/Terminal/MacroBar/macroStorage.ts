/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type Macro } from './types';

const STORAGE_KEY = 'pc_nrfconnect_serial_macros';

export const DEFAULT_MACROS: Macro[] = [
    {
        id: 'default-at',
        name: 'AT Ping',
        payload: 'AT',
        delayMs: 50,
        color: '#00a9ce',
    },
    {
        id: 'default-modem-info',
        name: 'Modem Info',
        payload: 'AT+CGMI\nAT+CGMM\nAT+CGMR',
        delayMs: 150,
        color: '#4caf50',
    },
    {
        id: 'default-zephyr-help',
        name: 'Zephyr Help',
        payload: 'help',
        delayMs: 50,
        color: '#ff9800',
    },
];

export const loadMacros = (): Macro[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch {
        // Fallback to default
    }
    return DEFAULT_MACROS;
};

export const saveMacros = (macros: Macro[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(macros));
    } catch {
        // Storage failed
    }
};

export const exportMacros = (macros: Macro[]): void => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(macros, null, 2),
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'nrf-serial-macros.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
};

export const importMacros = (file: File): Promise<Macro[]> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const content = event.target?.result as string;
                const parsed = JSON.parse(content);
                if (Array.isArray(parsed)) {
                    const validated: Macro[] = parsed
                        .filter(item => item && typeof item.name === 'string')
                        .map((item, idx) => ({
                            id: item.id || `imported-${Date.now()}-${idx}`,
                            name: String(item.name || 'Macro'),
                            payload: String(item.payload || ''),
                            delayMs: Number(item.delayMs) || 50,
                            color: item.color || '#00a9ce',
                        }));
                    resolve(validated);
                } else {
                    reject(new Error('Invalid format: expected JSON array'));
                }
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
