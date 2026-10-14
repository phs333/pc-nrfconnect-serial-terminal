/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-alert */
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { MacroModal } from './MacroModal';
import {
    DEFAULT_MACROS,
    exportMacros,
    importMacros,
    loadMacros,
    saveMacros,
} from './macroStorage';
import { type Macro } from './types';

import './macroBar.scss';

interface MacroBarProps {
    onExecuteCommand: (command: string) => void;
    connected: boolean;
}

export const MacroBar: React.FC<MacroBarProps> = ({
    onExecuteCommand,
    connected,
}) => {
    const [macros, setMacros] = useState<Macro[]>(() => loadMacros());
    const [activeMacroId, setActiveMacroId] = useState<string | null>(null);
    const [runningProgress, setRunningProgress] = useState<{
        current: number;
        total: number;
    } | null>(null);
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        editingMacro: Macro | null;
    }>({
        isOpen: false,
        editingMacro: null,
    });

    const abortRef = useRef(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Persist changes
    useEffect(() => {
        saveMacros(macros);
    }, [macros]);

    const executeMacro = useCallback(
        async (macro: Macro) => {
            if (!connected || activeMacroId) return;

            const lines = macro.payload
                .split(/\r?\n/)
                .map(l => l.trim())
                .filter(l => l.length > 0);

            if (lines.length === 0) return;

            setActiveMacroId(macro.id);
            abortRef.current = false;

            try {
                for (let i = 0; i < lines.length; i += 1) {
                    if (abortRef.current) break;

                    setRunningProgress({
                        current: i + 1,
                        total: lines.length,
                    });

                    onExecuteCommand(lines[i]);

                    if (macro.delayMs > 0 && i < lines.length - 1) {
                        // eslint-disable-next-line no-await-in-loop
                        await new Promise(res => {
                            setTimeout(res, macro.delayMs);
                        });
                    }
                }
            } finally {
                setActiveMacroId(null);
                setRunningProgress(null);
                abortRef.current = false;
            }
        },
        [connected, activeMacroId, onExecuteCommand],
    );

    const handleStop = () => {
        abortRef.current = true;
    };

    const handleSaveMacro = (savedMacro: Macro) => {
        setMacros(prev => {
            const index = prev.findIndex(m => m.id === savedMacro.id);
            const next =
                index >= 0
                    ? prev.map(m => (m.id === savedMacro.id ? savedMacro : m))
                    : [...prev, savedMacro];
            saveMacros(next);
            return next;
        });
    };

    const handleDeleteMacro = (id: string) => {
        setMacros(prev => {
            const next = prev.filter(m => m.id !== id);
            saveMacros(next);
            return next;
        });
    };

    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const imported = await importMacros(file);
            if (imported.length > 0) {
                if (
                    window.confirm(
                        `Import ${imported.length} macros? This will append to your current list.`,
                    )
                ) {
                    setMacros(prev => {
                        const next = [...prev, ...imported];
                        saveMacros(next);
                        return next;
                    });
                }
            }
        } catch (err) {
            window.alert(
                `Failed to import macros: ${
                    err instanceof Error ? err.message : String(err)
                }`,
            );
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleResetDefaults = () => {
        if (window.confirm('Reset macro buttons to default presets?')) {
            setMacros(DEFAULT_MACROS);
            saveMacros(DEFAULT_MACROS);
        }
    };

    return (
        <div className="macro-bar">
            <span
                className="macro-bar-label"
                title="Custom serial macro buttons"
            >
                Macros:
            </span>

            <div className="macro-list">
                {macros.map(macro => {
                    const isRunning = activeMacroId === macro.id;
                    const linesCount = macro.payload
                        .split(/\r?\n/)
                        .filter(l => l.trim().length > 0).length;

                    return (
                        <div
                            key={macro.id}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                        >
                            <button
                                type="button"
                                className={`macro-btn ${
                                    isRunning ? 'macro-btn-active' : ''
                                }`}
                                onClick={() => executeMacro(macro)}
                                onContextMenu={e => {
                                    e.preventDefault();
                                    setModalState({
                                        isOpen: true,
                                        editingMacro: macro,
                                    });
                                }}
                                title={`${macro.name}\n${linesCount} command(s), ${macro.delayMs}ms delay\n\nPreview:\n${macro.payload}\n(Right-click to edit)`}
                                disabled={
                                    !connected ||
                                    (activeMacroId !== null && !isRunning)
                                }
                            >
                                {macro.color && (
                                    <span
                                        className="macro-color-dot"
                                        style={{ backgroundColor: macro.color }}
                                    />
                                )}
                                <span>{macro.name}</span>
                                <span
                                    className="macro-edit-trigger"
                                    onClick={e => {
                                        e.stopPropagation();
                                        setModalState({
                                            isOpen: true,
                                            editingMacro: macro,
                                        });
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.stopPropagation();
                                            setModalState({
                                                isOpen: true,
                                                editingMacro: macro,
                                            });
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    title="Edit macro"
                                    aria-label={`Edit ${macro.name}`}
                                >
                                    &#9998;
                                </span>
                            </button>
                        </div>
                    );
                })}

                {macros.length === 0 && (
                    <span style={{ fontSize: '11px', color: '#90a4ae' }}>
                        No macros configured. Click + to add one.
                    </span>
                )}
            </div>

            {runningProgress && (
                <div className="macro-running-indicator">
                    <span>
                        Sending {runningProgress.current}/
                        {runningProgress.total}
                    </span>
                    <button
                        type="button"
                        className="stop-btn"
                        onClick={handleStop}
                        title="Cancel remaining macro commands"
                    >
                        Stop
                    </button>
                </div>
            )}

            <div className="macro-actions">
                <button
                    type="button"
                    className="macro-action-btn"
                    onClick={() => {
                        setModalState({ isOpen: true, editingMacro: null });
                    }}
                    title="Add new macro button"
                >
                    + Add
                </button>
                <button
                    type="button"
                    className="macro-action-btn"
                    onClick={() => exportMacros(macros)}
                    title="Export macros to JSON file"
                    disabled={macros.length === 0}
                >
                    Export
                </button>
                <button
                    type="button"
                    className="macro-action-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Import macros from JSON file"
                >
                    Import
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleFileImport}
                />
                <button
                    type="button"
                    className="macro-action-btn"
                    onClick={handleResetDefaults}
                    title="Reset to default examples"
                >
                    &#8634;
                </button>
            </div>

            <MacroModal
                isOpen={modalState.isOpen}
                macro={modalState.editingMacro}
                onClose={() => {
                    setModalState({ isOpen: false, editingMacro: null });
                }}
                onSave={handleSaveMacro}
                onDelete={handleDeleteMacro}
            />
        </div>
    );
};
