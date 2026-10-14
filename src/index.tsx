/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { getCurrentWindow } from '@electron/remote';
import {
    App,
    render,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import appReducer from './appReducer';
import DeviceSelector from './components/DeviceSelector';
import DocumentationSections from './components/DocumentationSection';
import Terminal from './components/Terminal/Main';
import TerminalSidePanel from './components/Terminal/SidePanel';
import TerminalSettings from './features/settings';

try {
    getCurrentWindow()?.setBackgroundColor('#23282d');
} catch {
    // Ignore in non-electron or test environments
}

telemetry.enableTelemetry();

render(
    <App
        appReducer={appReducer}
        deviceSelect={<DeviceSelector />}
        sidePanel={<TerminalSidePanel />}
        documentation={DocumentationSections}
        panes={[
            {
                name: 'Terminal',
                Main: Terminal,
            },
            {
                name: 'Settings',
                Main: TerminalSettings,
            },
        ]}
        autoReselectByDefault
    />,
);
