const ContextMenu = require('./modules/context-menu.js');
const Storage = require('./modules/storage.js');
const ExtensionOptions = require('./modules/options.js');

chrome.tabs.onCreated.addListener(ContextMenu.refresh);
chrome.tabs.onRemoved.addListener(ContextMenu.refresh);

chrome.windows.onCreated.addListener(ContextMenu.refresh);
chrome.windows.onFocusChanged.addListener(ContextMenu.refresh);

chrome.runtime.onStartup.addListener(ContextMenu.refresh);
chrome.runtime.onInstalled.addListener(details => {
    if (details.reason == "install") {
        ExtensionOptions.forEach(option => {
            let defaultOption = option.values.find(x => x.isDefault);
            Storage.save(option.id, defaultOption.value);
        });
    }
    ContextMenu.refresh();
});