/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export interface Macro {
    id: string;
    name: string;
    payload: string;
    delayMs: number;
    color?: string;
}

export const PRESET_COLORS = [
    { label: 'Blue', value: '#00a9ce' },
    { label: 'Green', value: '#4caf50' },
    { label: 'Orange', value: '#ff9800' },
    { label: 'Red', value: '#f44336' },
    { label: 'Purple', value: '#9c27b0' },
    { label: 'Slate', value: '#607d8b' },
];
