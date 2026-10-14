/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { DEFAULT_MACROS, loadMacros, saveMacros } from '../macroStorage';
import { type Macro } from '../types';

describe('macroStorage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('returns default macros when localStorage is empty', () => {
        const macros = loadMacros();
        expect(macros).toEqual(DEFAULT_MACROS);
    });

    it('saves and loads custom macros correctly', () => {
        const customMacros: Macro[] = [
            {
                id: 'test-1',
                name: 'Test Macro',
                payload: 'AT\nAT+CSQ',
                delayMs: 200,
                color: '#4caf50',
            },
        ];

        saveMacros(customMacros);
        const loaded = loadMacros();
        expect(loaded).toHaveLength(1);
        expect(loaded[0].name).toBe('Test Macro');
        expect(loaded[0].payload).toBe('AT\nAT+CSQ');
        expect(loaded[0].delayMs).toBe(200);
    });
});
