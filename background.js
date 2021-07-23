import "core-js/stable";
import "regenerator-runtime/runtime";

const ContextMenu = require('./src/modules/context-menu.js');
const Storage = require('./src/modules/storage.js');
const ExtensionOptions = require('./src/modules/options.js');

chrome.tabs.onCreated.addListener(ContextMenu.refresh);
chrome.tabs.onRemoved.addListener(ContextMenu.refresh);

chrome.windows.onCreated.addListener(ContextMenu.refresh);
chrome.windows.onFocusChanged.addListener(ContextMenu.refresh);

chrome.runtime.onStartup.addListener(ContextMenu.forceRefresh);
chrome.runtime.onInstalled.addListener(details => {
    if (details.reason == "install") {
        ExtensionOptions.forEach(option => {
            let defaultOption = option.values.find(x => x.isDefault);
            Storage.save(option.id, defaultOption.value);
        });
    }
    ContextMenu.forceRefresh();
});

chrome.contextMenus.onClicked.addListener(ContextMenu.onClicked);