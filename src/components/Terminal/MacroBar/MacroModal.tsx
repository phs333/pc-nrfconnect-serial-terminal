/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-alert */
import React, { useEffect, useState } from 'react';

import { type Macro, PRESET_COLORS } from './types';

interface MacroModalProps {
    isOpen: boolean;
    macro: Macro | null; // null if creating a new macro
    onClose: () => void;
    onSave: (macro: Macro) => void;
    onDelete?: (id: string) => void;
}

export const MacroModal: React.FC<MacroModalProps> = ({
    isOpen,
    macro,
    onClose,
    onSave,
    onDelete,
}) => {
    const [name, setName] = useState('');
    const [payload, setPayload] = useState('');
    const [delayMs, setDelayMs] = useState(50);
    const [color, setColor] = useState(PRESET_COLORS[0].value);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (macro) {
            setName(macro.name);
            setPayload(macro.payload);
            setDelayMs(macro.delayMs ?? 50);
            setColor(macro.color ?? PRESET_COLORS[0].value);
        } else {
            setName('');
            setPayload('');
            setDelayMs(50);
            setColor(PRESET_COLORS[0].value);
        }
        setError(null);
    }, [macro, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name.trim()) {
            setError('Please enter a name for the macro.');
            return;
        }
        if (!payload.trim()) {
            setError('Please enter at least one command.');
            return;
        }

        onSave({
            id: macro ? macro.id : `macro-${Date.now()}`,
            name: name.trim(),
            payload: payload.trim(),
            delayMs: Math.max(0, delayMs),
            color,
        });
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div
            className="macro-modal-backdrop"
            onClick={handleBackdropClick}
            onKeyDown={handleBackdropKeyDown}
            role="presentation"
        >
            <div
                className="macro-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="macro-modal-title"
            >
                <div className="macro-modal-header">
                    <span id="macro-modal-title">
                        {macro ? 'Edit Macro' : 'Add New Macro'}
                    </span>
                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                <div className="macro-modal-body">
                    {error && (
                        <div
                            style={{
                                color: '#f44336',
                                fontSize: '12px',
                                padding: '4px 8px',
                                backgroundColor: 'rgba(244,67,54,0.1)',
                                borderRadius: '4px',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <span className="form-label">Macro Name</span>
                        <input
                            type="text"
                            placeholder="e.g. AT Ping, Config BLE, Reset"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <span className="form-label">
                            Commands (one per line)
                        </span>
                        <div className="form-hint">
                            Multi-line commands will be sent sequentially with
                            the delay specified below.
                        </div>
                        <textarea
                            placeholder="AT&#10;AT+CGMI&#10;AT+CGMM"
                            value={payload}
                            onChange={e => setPayload(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <span className="form-label">
                            Line Delay (milliseconds)
                        </span>
                        <div className="form-hint">
                            Delay between sending each line (avoids device
                            serial buffer overflow).
                        </div>
                        <input
                            type="number"
                            min="0"
                            step="10"
                            value={delayMs}
                            onChange={e =>
                                setDelayMs(parseInt(e.target.value, 10) || 0)
                            }
                        />
                    </div>

                    <div className="form-group">
                        <span>Color Accent</span>
                        <div className="color-picker-row">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c.value}
                                    type="button"
                                    className={`color-swatch ${
                                        color === c.value ? 'selected' : ''
                                    }`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.label}
                                    aria-label={c.label}
                                    onClick={() => setColor(c.value)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="macro-modal-footer">
                    <div>
                        {macro && onDelete && (
                            <button
                                type="button"
                                className="btn-danger"
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            `Delete macro "${macro.name}"?`,
                                        )
                                    ) {
                                        onDelete(macro.id);
                                        onClose();
                                    }
                                }}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                    <div className="footer-right">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={handleSave}
                        >
                            Save Macro
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
