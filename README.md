# ![icon](/assets/teleport32x32.png) Teleport
Chromium extension to move tabs around the browser's windows from context menu or with keyboard shortcuts.

Works (tested) with Chrome and Edge browsers. Although the browsers offer a similar features already, this extension adds an option to the tab's context menu when you click inside the page, and also allows you to move multiple tabs at once. The extension also adds **keyboard shortcuts** for more convenient usage.

It's also a good project for me to learn how to make browser extensions :) 

## Features
With this extension, you can easily transport tabs from one of your open windows to another. The extension offers new options in the context menu of the tab, where you can select a "teleport" target -- the window where to move the tab to.

The extension allows you to: 
* **move the current tab to a new window**, if you have more than one tabs in the window,
* **move the current tab to another window**, if you have precisely two windows in the window,
* **move the current tab to one of the other windows**, if you have more than two windows (you can select which one),
* **move all the tabs** to one of the aforementioned targets. 

To some extent the extension allows you to configure the behavior of teleport action (e.g. you can choose if the teleport tab should be placed on the beginning or on the end on the tab bar). More options to be added in the future. 

If you have a feature request, feel free to [open an issue](https://github.com/vajsm/teleport-extension/issues).

### Keyboard shortcuts
If the command is applicable for the current window, you can invoke it with the following keyboard shortcuts: 

* `Alt+O` -- Move the current tab to a new window 
* `Alt+P` -- Move the current tab to another window (if exists)
* `Alt+L` -- Move all the tabs to another window (if exists)

In the future releases the extension will let you to configure the shortcuts to match your preference, or disable them completely.

## Limitations/known issues
* Incognito windows not yet supported
* The only supported language for now is `en` -- due to the current limitations of background service workers. Details in `src/modules/localization.js`.

## Installation
The extension is published in Chrome Web Store:
https://chrome.google.com/webstore/detail/teleport-extension/bkpcdmdbhnbhmonmahnmblinbbahojlh?hl=pl&authuser=2 
Leave a review if you use the extension! :) 

### Local build
You can build the extension locally from source. 

1. Install nodejs, npm, webpack and the required packages
```
# On Ubuntu:

sudo apt install nodejs npm 
sudo npm install -g webpack webpack-cli
cd teleport-extension
npm install
```
2. For running local (dev) build with watch:
```
npm start
```
3. For running unit tests:
```
npm run tests
```
4. For production build:
```
npm run build
```
5. Install the extension in the browser by visiting `chrome://extensions` and selecting `Load unpacked` option. Point the browser to `dist\dev` or `dist\prod` directory of the extension. If you started the build in dev mode with watch, webpack will automatically rebuild the source upon any changes, but you will need to refresh the extension in the browser to see the effects. If you chose to build prod version, you will find your packed extension with .crx file format in the `dist/` directory.

## Architecture
* Chromium extension with manifest v2 (to be ported to v3 once it's more stable)
* Webpack-based build
* Mocha tests

### Directories
```
/_locales       - support for localization
/assets         - images, icons and other assets
/dist           - directory auto-generated by webpack on build
/node_modules   - directory created on npm install step
/src            - HTML, CSS and JS files
    /modules    - JS modules not referred directly from the extension, but used e.g. by the background script
    background.js   - background entry point referred from the manifest
/tests          - Mocha tests for JS modules
/webpack        - webpack configurations
manifest.json   - definition of the extension
package.json    - definition of the package
packagekey.pem  - certificate used to package CRX

```
Webpack will process all the source files, copy the assets and extension manifest to dist directory. This directory is the root for the unpacked extension installed in the browser.

### Certificate
`packagekey.pem` needs to be generated with the command:
```
openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt > packagekey.pem
```

### Credits
Many thanks to [salsita](https://github.com/salsita/chrome-extension-skeleton) for providing a good entry point for building browser extensions.

[Portal icon by Icons8.](https://icons8.com/icon/Z6mGeoFxQMQY/portal)
