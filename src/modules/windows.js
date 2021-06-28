var _lastFocusedWindowId = -1;
var _lastFocusedWindowTabsCount = -1;

/**
 * Module responsible for handling browser windows related operations.
 */
var Windows = {
    /**
     * Retrieves all (normal) windows of the browser.
     * 
     * @param {*} callback - fired after the windows are determined
     */
    getAll: function (callback) {
        chrome.windows.getAll({
            "windowTypes": [ "normal" ],
            "populate": true
        }, callback);
    },
    /**
     * Retrieves the last known focused window.
     * 
     * @param {*} callback - fired after the last focused window is determined
     */
    getFocused: function (callback) {
        chrome.windows.getLastFocused({
            "windowTypes": [ "normal" ],
            "populate": true
        },
        callback);
    },
    /**
     * Defines a name for the window, in regards to its position in the set.
     * 
     * @param {chrome.windows.Window} window 
     * @param {int} idx 
     * @returns 
     */
    getName: function (window, idx) {
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
     * @returns 
     */
    isRefreshRequired: function (window) {

        const tabsCount = window.tabs.length;
        const focusChanged = _lastFocusedWindowId != window.id;
        const tabsCountChanged = _lastFocusedWindowTabsCount != tabsCount 
                            && tabsCount <= 2;    // We only care about that change if there is a change from a single to multiple tabs and vice versa
        
        return focusChanged || tabsCountChanged;
    },
    /**
     * Saves the state of the currently focused window.
     * 
     * @param {chrome.windows.Window} window 
     */
    saveFocusedWindow: function (window) {
        _lastFocusedWindowId = window.id;
        _lastFocusedWindowTabsCount = window.tabs.length;
    },
}

export { Windows };