/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    coloriseLogLine,
    createEspLogStreamProcessor,
    hasAnsiCodes,
    TERMINAL_ANSI_THEME,
} from '../ansiEspLog';

describe('ansiEspLog', () => {
    describe('TERMINAL_ANSI_THEME', () => {
        it('defines all 16 standard ANSI colors', () => {
            expect(TERMINAL_ANSI_THEME.black).toBeDefined();
            expect(TERMINAL_ANSI_THEME.red).toBe('#f44336');
            expect(TERMINAL_ANSI_THEME.green).toBe('#4caf50');
            expect(TERMINAL_ANSI_THEME.yellow).toBe('#ffb300');
            expect(TERMINAL_ANSI_THEME.blue).toBe('#29b6f6');
            expect(TERMINAL_ANSI_THEME.brightRed).toBe('#ff5252');
            expect(TERMINAL_ANSI_THEME.brightGreen).toBe('#69f0ae');
        });
    });

    describe('coloriseLogLine', () => {
        it('colorises ESP-IDF Info log', () => {
            const raw = 'I (1234) main: Connected to AP';
            const colorised = coloriseLogLine(raw);
            expect(hasAnsiCodes(colorised)).toBe(true);
            expect(colorised).toContain('\x1b[1;32mI\x1b[0m');
            expect(colorised).toContain('(1234)');
            expect(colorised).toContain('main:');
            expect(colorised).toContain('Connected to AP');
        });

        it('colorises ESP-IDF Warning log', () => {
            const raw = 'W (5432) wifi: Disconnected';
            const colorised = coloriseLogLine(raw);
            expect(colorised).toContain('\x1b[1;33mW\x1b[0m');
            expect(colorised).toContain('wifi:');
        });

        it('colorises ESP-IDF Error log', () => {
            const raw = 'E (999) esp_netif: Failed to initialize netif';
            const colorised = coloriseLogLine(raw);
            expect(colorised).toContain('\x1b[1;31mE\x1b[0m');
            expect(colorised).toContain('esp_netif:');
        });

        it('colorises ESP-IDF Debug and Verbose log', () => {
            const debugLine = 'D (100) heap: Free 219488';
            expect(coloriseLogLine(debugLine)).toContain('\x1b[1;36mD\x1b[0m');

            const verboseLine = 'V (101) mem: Alloc 64';
            expect(coloriseLogLine(verboseLine)).toContain('V');
        });

        it('handles ESP-IDF log with core ID', () => {
            const raw = 'I (1234) [core 0] task: Started';
            const colorised = coloriseLogLine(raw);
            expect(colorised).toContain('[core 0]');
            expect(colorised).toContain('task:');
        });

        it('colorises ESP Panic and Backtrace', () => {
            const panic = "Guru Meditation Error: Core 0 panic'ed";
            expect(coloriseLogLine(panic)).toContain('\x1b[1;37;41m');

            const backtrace = 'Backtrace: 0x40081234:0x3ffb0000';
            expect(coloriseLogLine(backtrace)).toContain('Backtrace:');
        });

        it('colorises Zephyr logs', () => {
            const zephyr = '<err> sensor: read timeout';
            expect(coloriseLogLine(zephyr)).toContain('<err>');
        });

        it('preserves lines that already contain ANSI escape codes', () => {
            const existingAnsi = '\x1b[0;32mI (1234) main: Hello\x1b[0m';
            expect(coloriseLogLine(existingAnsi)).toBe(existingAnsi);
        });

        it('returns regular serial text untouched', () => {
            const regular = 'AT+CSQ\r\n+CSQ: 31,99';
            expect(coloriseLogLine(regular)).toBe(regular);
        });
    });

    describe('createEspLogStreamProcessor', () => {
        it('processes and emits complete lines across multiple chunks', () => {
            const emitted: string[] = [];
            const processor = createEspLogStreamProcessor(out => {
                emitted.push(out);
            });

            processor.write('I (123) main: Start');
            processor.write('ing server...\n');

            expect(emitted).toHaveLength(1);
            expect(emitted[0]).toContain('\x1b[1;32mI\x1b[0m');
            expect(emitted[0]).toContain('Starting server...');
        });

        it('flushes incomplete trailing data after timeout', done => {
            const emitted: string[] = [];
            const processor = createEspLogStreamProcessor(out => {
                emitted.push(out);
            });

            processor.write('esp32> ');

            setTimeout(() => {
                expect(emitted).toHaveLength(1);
                expect(emitted[0]).toBe('esp32> ');
                done();
            }, 60);
        });
    });
});
