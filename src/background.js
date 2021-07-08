import ContextMenu from './modules/context-menu.js';

chrome.runtime.onInstalled.addListener(ContextMenu.refresh);
chrome.runtime.onStartup.addListener(ContextMenu.refresh);

chrome.tabs.onCreated.addListener(ContextMenu.refresh);
chrome.tabs.onRemoved.addListener(ContextMenu.refresh);

chrome.windows.onCreated.addListener(ContextMenu.refresh);
chrome.windows.onFocusChanged.addListener(ContextMenu.refresh);

chrome.runtime.onInstalled.addListener((details) => {



});