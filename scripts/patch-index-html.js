/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const distHtmlPath = path.join(distDir, 'index.html');
const distBootstrapCssPath = path.join(distDir, 'bootstrap.css');
const distBundleCssPath = path.join(distDir, 'bundle.css');

// 1. Patch dist/index.html
const htmlContent = `<!DOCTYPE html>
<html lang="en" style="background-color: #23282d; background: #23282d;">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Serial Terminal</title>
    <script>
        try {
            const { getCurrentWindow } = require('@electron/remote');
            const win = getCurrentWindow();
            if (win) {
                win.setBackgroundColor('#23282d');
            }
        } catch (e) {}
    </script>
    <style>
        html, body, #webapp {
            background-color: #23282d !important;
            background: #23282d !important;
            color: #d8d8d8;
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        #webapp {
            height: 100%;
        }
        #app-loader {
            border: 8px solid rgba(0, 169, 206, 0.2) !important;
            border-left: 8px solid #00a9ce !important;
        }
        .initial-splash {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #23282d;
            color: #eceff1;
            user-select: none;
        }
        .initial-spinner {
            width: 38px;
            height: 38px;
            border: 3px solid rgba(0, 169, 206, 0.2);
            border-top: 3px solid #00a9ce;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 16px;
        }
        .initial-title {
            font-size: 14px;
            font-weight: 500;
            color: #b0bec5;
            letter-spacing: 0.5px;
        }
        .initial-subtitle {
            font-size: 11px;
            color: #607d8b;
            margin-top: 4px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
    <link rel="stylesheet" href="bootstrap.css">
    <link rel="stylesheet" href="bundle.css">
    <script>
        try {
            const path = require('path');
            const params = new URL(window.location).searchParams;
            const launcherPath = params.get('launcherPath');
            if (launcherPath) {
                module.paths.unshift(path.join(launcherPath, '/node_modules'));
                const fontLink = document.createElement('link');
                fontLink.rel = 'stylesheet';
                fontLink.type = 'text/css';
                fontLink.href = path.join(launcherPath, 'dist', 'fonts.css');
                document.head.appendChild(fontLink);
            }
        } catch (err) {
            console.error('Error initializing launcher font styles:', err);
        }
    </script>
    <script src="bundle.js" defer></script>
</head>
<body style="background-color: #23282d !important; background: #23282d !important;">
    <div id="webapp">
        <div class="initial-splash">
            <div class="initial-spinner"></div>
            <div class="initial-title">Serial Terminal</div>
            <div class="initial-subtitle">Carregando interface e conexões...</div>
        </div>
    </div>
</body>
</html>
`;

fs.writeFileSync(distHtmlPath, htmlContent, 'utf8');
console.log(
    'Successfully patched dist/index.html with dark Nordic theme & instant splash screen.',
);

// 2. Patch dist/bootstrap.css
const darkThemeOverrideCss = `/* Nordic Dark Theme Launcher Override */
html, body, #webapp {
  background-color: #23282d !important;
  background: #23282d !important;
  color: #eceff1 !important;
}
#app-loader {
  border: 8px solid rgba(0, 169, 206, 0.2) !important;
  border-left: 8px solid #00a9ce !important;
}
`;

if (fs.existsSync(distBootstrapCssPath)) {
    let bootstrapContent = fs.readFileSync(distBootstrapCssPath, 'utf8');
    if (!bootstrapContent.includes('Nordic Dark Theme Launcher Override')) {
        bootstrapContent = `${darkThemeOverrideCss}\n${bootstrapContent}`;
    }
    bootstrapContent = bootstrapContent.replace(
        /body\s*\{([^}]*?)background-color:\s*#fff;([^}]*?)\}/g,
        'body {$1background-color: #23282d;$2}',
    );
    fs.writeFileSync(distBootstrapCssPath, bootstrapContent, 'utf8');
    console.log(
        'Successfully patched dist/bootstrap.css to eliminate white flash and style app-loader.',
    );
}

// 3. Patch dist/bundle.css
if (fs.existsSync(distBundleCssPath)) {
    let bundleContent = fs.readFileSync(distBundleCssPath, 'utf8');
    if (!bundleContent.includes('Nordic Dark Theme Launcher Override')) {
        bundleContent = `${darkThemeOverrideCss}\n${bundleContent}`;
        fs.writeFileSync(distBundleCssPath, bundleContent, 'utf8');
        console.log(
            'Successfully patched dist/bundle.css with dark theme override.',
        );
    }
}
