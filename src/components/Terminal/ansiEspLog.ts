/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/**
 * ANSI 16-color theme palette optimized for the Nordic dark terminal theme (#263238).
 */
export const TERMINAL_ANSI_THEME = {
    foreground: '#eceff1',
    background: '#263238',
    cursor: '#00a9ce',
    cursorAccent: '#263238',
    selectionBackground: 'rgba(0, 169, 206, 0.35)',
    selectionInactiveBackground: 'rgba(0, 169, 206, 0.2)',
    // Standard 8 ANSI colors (0-7)
    black: '#263238',
    red: '#f44336',
    green: '#4caf50',
    yellow: '#ffb300',
    blue: '#29b6f6',
    magenta: '#ab47bc',
    cyan: '#00bcd4',
    white: '#eceff1',
    // High-intensity 8 ANSI colors (8-15)
    brightBlack: '#78909c',
    brightRed: '#ff5252',
    brightGreen: '#69f0ae',
    brightYellow: '#ffd740',
    brightBlue: '#40c4ff',
    brightMagenta: '#e040fb',
    brightCyan: '#18ffff',
    brightWhite: '#ffffff',
};

// ANSI escape sequences
const ANSI_RESET = '\x1b[0m';
const ANSI_RED = '\x1b[31m';
const ANSI_BOLD_RED = '\x1b[1;31m';
const ANSI_BOLD_GREEN = '\x1b[1;32m';
const ANSI_YELLOW = '\x1b[33m';
const ANSI_BOLD_YELLOW = '\x1b[1;33m';
const ANSI_CYAN = '\x1b[36m';
const ANSI_BOLD_CYAN = '\x1b[1;36m';
const ANSI_MAGENTA = '\x1b[35m';
const ANSI_WHITE = '\x1b[37m';
const ANSI_GRAY = '\x1b[90m';
const ANSI_BOLD_GRAY = '\x1b[1;90m';
const ANSI_WHITE_ON_RED = '\x1b[1;37;41m';

// Detect whether a line already contains ANSI escape codes
// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE_REGEX = /\x1b\[[0-9;]*[a-zA-Z]/;

export const hasAnsiCodes = (text: string): boolean =>
    ANSI_ESCAPE_REGEX.test(text);

/**
 * ESP-IDF log line patterns:
 * Standard: E (1234) TAG: message
 * With core: I (1234) [core 0] TAG: message
 * Floating timestamp: I (1234.567) TAG: message
 */
const ESP_LOG_REGEX =
    /^([EWIDV])\s*\(([0-9]+(?:\.[0-9]+)?)\)\s*(?:\[([^\]]+)\]\s*)?(?:([a-zA-Z0-9_.-]+):\s*)?(.*)$/;

/**
 * Zephyr log line patterns:
 * <err> tag: message
 * <wrn> tag: message
 * <inf> tag: message
 * <dbg> tag: message
 */
const ZEPHYR_LOG_REGEX =
    /^<(err|wrn|inf|dbg)>\s*(?:([a-zA-Z0-9_.-]+):\s*)?(.*)$/i;

/**
 * Bracket-style log levels:
 * [ERROR] message
 * [WARN] message
 * [INFO] message
 * [DEBUG] message
 */
const BRACKET_LOG_REGEX =
    /^\[(ERROR|WARN|WARNING|INFO|DEBUG|TRACE|FATAL)\]\s*(.*)$/i;

// ESP32 / FreeRTOS Crash and Panic patterns
const PANIC_LOG_REGEX =
    /^(Guru Meditation Error:.*|Backtrace:.*|Core \d+ register dump:.*|Register dump:.*|assert failed:.*)/i;

// Colorizes a single log line if it matches known ESP-IDF, Zephyr, or panic patterns
// and does not already contain ANSI escape codes.
export const coloriseLogLine = (line: string): string => {
    if (!line || line.trim().length === 0) return line;

    // Preserve existing ANSI colors
    if (hasAnsiCodes(line)) {
        return line;
    }

    // 1. ESP-IDF Log format
    const espMatch = line.match(ESP_LOG_REGEX);
    if (espMatch) {
        const [, level, timestamp, core, tag, msg] = espMatch;
        const corePart = core ? ` ${ANSI_MAGENTA}[${core}]${ANSI_RESET}` : '';
        const timePart = `${ANSI_YELLOW}(${timestamp})${ANSI_RESET}`;

        switch (level) {
            case 'E': {
                const tagPart = tag
                    ? ` ${ANSI_BOLD_RED}${tag}:${ANSI_RESET}`
                    : '';
                return `${ANSI_BOLD_RED}E${ANSI_RESET} ${timePart}${corePart}${tagPart} ${ANSI_RED}${msg}${ANSI_RESET}`;
            }
            case 'W': {
                const tagPart = tag
                    ? ` ${ANSI_BOLD_YELLOW}${tag}:${ANSI_RESET}`
                    : '';
                return `${ANSI_BOLD_YELLOW}W${ANSI_RESET} ${timePart}${corePart}${tagPart} ${ANSI_YELLOW}${msg}${ANSI_RESET}`;
            }
            case 'I': {
                const tagPart = tag
                    ? ` ${ANSI_BOLD_CYAN}${tag}:${ANSI_RESET}`
                    : '';
                return `${ANSI_BOLD_GREEN}I${ANSI_RESET} ${timePart}${corePart}${tagPart} ${ANSI_WHITE}${msg}${ANSI_RESET}`;
            }
            case 'D': {
                const tagPart = tag ? ` ${ANSI_GRAY}${tag}:${ANSI_RESET}` : '';
                return `${ANSI_BOLD_CYAN}D${ANSI_RESET} ${timePart}${corePart}${tagPart} ${ANSI_CYAN}${msg}${ANSI_RESET}`;
            }
            case 'V': {
                const tagPart = tag ? ` ${ANSI_GRAY}${tag}:${ANSI_RESET}` : '';
                return `${ANSI_BOLD_GRAY}V${ANSI_RESET} ${ANSI_GRAY}(${timestamp})${ANSI_RESET}${corePart}${tagPart} ${ANSI_GRAY}${msg}${ANSI_RESET}`;
            }
            default:
                break;
        }
    }

    // 2. ESP Panic / Guru Meditation / Crash dumps
    if (PANIC_LOG_REGEX.test(line)) {
        if (/^Guru Meditation/i.test(line)) {
            return `${ANSI_WHITE_ON_RED} ${line.trim()} ${ANSI_RESET}`;
        }
        if (/^Backtrace:/i.test(line)) {
            return `${ANSI_BOLD_RED}Backtrace:${ANSI_RESET} ${ANSI_YELLOW}${line.replace(/^Backtrace:\s*/i, '')}${ANSI_RESET}`;
        }
        return `${ANSI_BOLD_RED}${line}${ANSI_RESET}`;
    }

    // 3. Zephyr Log format (<err>, <wrn>, <inf>, <dbg>)
    const zephyrMatch = line.match(ZEPHYR_LOG_REGEX);
    if (zephyrMatch) {
        const [, level, tag, msg] = zephyrMatch;
        const tagPart = tag ? ` ${ANSI_BOLD_CYAN}${tag}:${ANSI_RESET}` : '';
        const lvlLower = level.toLowerCase();

        switch (lvlLower) {
            case 'err':
                return `${ANSI_BOLD_RED}<err>${ANSI_RESET}${tagPart} ${ANSI_RED}${msg}${ANSI_RESET}`;
            case 'wrn':
                return `${ANSI_BOLD_YELLOW}<wrn>${ANSI_RESET}${tagPart} ${ANSI_YELLOW}${msg}${ANSI_RESET}`;
            case 'inf':
                return `${ANSI_BOLD_GREEN}<inf>${ANSI_RESET}${tagPart} ${ANSI_WHITE}${msg}${ANSI_RESET}`;
            case 'dbg':
                return `${ANSI_BOLD_CYAN}<dbg>${ANSI_RESET}${tagPart} ${ANSI_GRAY}${msg}${ANSI_RESET}`;
            default:
                break;
        }
    }

    // 4. Bracket Log format ([ERROR], [WARN], etc.)
    const bracketMatch = line.match(BRACKET_LOG_REGEX);
    if (bracketMatch) {
        const [, level, msg] = bracketMatch;
        const lvlUpper = level.toUpperCase();

        switch (lvlUpper) {
            case 'ERROR':
            case 'FATAL':
                return `${ANSI_BOLD_RED}[${lvlUpper}]${ANSI_RESET} ${ANSI_RED}${msg}${ANSI_RESET}`;
            case 'WARN':
            case 'WARNING':
                return `${ANSI_BOLD_YELLOW}[${lvlUpper}]${ANSI_RESET} ${ANSI_YELLOW}${msg}${ANSI_RESET}`;
            case 'INFO':
                return `${ANSI_BOLD_GREEN}[${lvlUpper}]${ANSI_RESET} ${ANSI_WHITE}${msg}${ANSI_RESET}`;
            case 'DEBUG':
            case 'TRACE':
                return `${ANSI_BOLD_CYAN}[${lvlUpper}]${ANSI_RESET} ${ANSI_GRAY}${msg}${ANSI_RESET}`;
            default:
                break;
        }
    }

    return line;
};

// Creates a stream processor for serial data chunks that buffers incomplete lines
// and colorizes completed lines while immediately flushing trailing chunks after a brief timeout.
export const createEspLogStreamProcessor = (
    onEmit: (processed: string) => void,
    isHighlightEnabled: () => boolean = () => true,
) => {
    let buffer = '';
    let flushTimeout: NodeJS.Timeout | null = null;

    const clearTimer = () => {
        if (flushTimeout !== null) {
            clearTimeout(flushTimeout);
            flushTimeout = null;
        }
    };

    const processLine = (rawLine: string): string => {
        if (!isHighlightEnabled()) return rawLine;

        // Strip carriage return for matching
        const hasCr = rawLine.endsWith('\r');
        const content = hasCr ? rawLine.slice(0, -1) : rawLine;
        const colorized = coloriseLogLine(content);

        return hasCr ? `${colorized}\r` : colorized;
    };

    const processChunk = (chunk: string): void => {
        clearTimer();
        buffer += chunk;

        if (!buffer.includes('\n')) {
            // No newline yet. Set a 40ms timer to flush interactive prompts (e.g. "esp32> ")
            flushTimeout = setTimeout(() => {
                if (buffer.length > 0) {
                    const toFlush = processLine(buffer);
                    buffer = '';
                    onEmit(toFlush);
                }
            }, 40);
            return;
        }

        // Split buffer on newlines
        const lines = buffer.split('\n');
        // The last element is whatever comes after the last newline (could be empty or partial line)
        buffer = lines.pop() ?? '';

        const outputPieces: string[] = [];
        for (let i = 0; i < lines.length; i += 1) {
            outputPieces.push(`${processLine(lines[i])}\n`);
        }

        if (outputPieces.length > 0) {
            onEmit(outputPieces.join(''));
        }

        if (buffer.length > 0) {
            flushTimeout = setTimeout(() => {
                if (buffer.length > 0) {
                    const toFlush = processLine(buffer);
                    buffer = '';
                    onEmit(toFlush);
                }
            }, 40);
        }
    };

    const flush = (): void => {
        clearTimer();
        if (buffer.length > 0) {
            const toFlush = processLine(buffer);
            buffer = '';
            onEmit(toFlush);
        }
    };

    return {
        write: processChunk,
        flush,
        reset: () => {
            clearTimer();
            buffer = '';
        },
    };
};
