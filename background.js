import "core-js/stable";
import "regenerator-runtime/runtime";

const ContextMenu = require('./src/modules/context-menu.js');
const Options = require('./src/modules/options.js').Options;

chrome.tabs.onCreated.addListener(ContextMenu.refresh);
chrome.tabs.onRemoved.addListener(ContextMenu.refresh);

chrome.windows.onCreated.addListener(ContextMenu.refresh);
chrome.windows.onFocusChanged.addListener(ContextMenu.refresh);

chrome.runtime.onStartup.addListener(ContextMenu.forceRefresh);
chrome.runtime.onInstalled.addListener(details => {
    if (details.reason == "install") {
        Options.setDefaults();
    }
    ContextMenu.forceRefresh();
});

chrome.contextMenus.onClicked.addListener(ContextMenu.onClicked);