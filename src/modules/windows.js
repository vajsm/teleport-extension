const Storage = require('./storage.js');

const StorageKeys = {
    lastFocusedWindowId: "_lastFocusedWindowId",
    lastFocusedWindowTabsCount: "_lastFocusedWindowTabsCount" 
};

/**
 * Module responsible for handling browser windows related operations.
 */
var Windows = {
    /**
     * Retrieves all (normal) windows of the browser.
     */
    getAll: async function() {
        return chrome.windows.getAll({
            "windowTypes": [ "normal" ],
            "populate": true
        });
    },

    /**
     * Retrieves the last known focused window.
     */
    getFocused: function() {
        return chrome.windows.getLastFocused({
            "windowTypes": [ "normal" ],
            "populate": true
        });
    },

    /**
     * Defines a name for the window, in regards to its position in the set.
     * 
     * @param {chrome.windows.Window} window 
     * @param {number} idx 
     * @returns 
     */
    getName: function(window, idx) {
        var windowName = `Window ${idx}`;
        if (window.incognito) {
            windowName += " (incognito)";
        }
        var highlightedTab = window.tabs.find(x => x.highlighted);
        if (highlightedTab != null) {
            windowName += ` -- ${highlightedTab.title}`;
        }
        return windowName;
    },

    /**
     * Determines if the context menu for a current window needs to be refreshed.
     * 
     * @param {chrome.windows.Window} window 
     * @returns true if the context menu needs to be refreshed
     */
    isRefreshRequired: async function(window) {
        const [lastWinId, lastTabCount] = await Promise.all([
            Storage.restore(StorageKeys.lastFocusedWindowId), 
            Storage.restore(StorageKeys.lastFocusedWindowTabsCount)
        ]);

        const tabsCount = window.tabs.length;
        const focusChanged = lastWinId != window.id;
        const tabsCountChanged = lastTabCount != tabsCount 
                              && tabsCount <= 2;    // We only care about that change if there is a change from a single to multiple tabs and vice versa

        return focusChanged || tabsCountChanged;
    },
    
    /**
     * Saves the state of the currently focused window.
     * 
     * @param {chrome.windows.Window} window 
     */
    saveFocusedWindow: async function(window) {
        return Promise.all([
            Storage.save(StorageKeys.lastFocusedWindowId, window.id),
            Storage.save(StorageKeys.lastFocusedWindowTabsCount, window.tabs.length)
        ]);
    },
}
module.exports = Windows;