var _lastFocusedWindowId = -1;
var _lastFocusedWindowTabsCount = -1;

var Windows = {

    getAll: function (callback) {
        chrome.windows.getAll({
            "windowTypes": [ "normal" ],
            "populate": true
        }, callback);
    },

    getFocused: function (callback) {
        chrome.windows.getLastFocused({
            "windowTypes": [ "normal" ],
            "populate": true
        },
        callback);
    },

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

    isRefreshRequired: function (window) {

        const tabsCount = window.tabs.length;
        const focusChanged = _lastFocusedWindowId != window.id;
        const tabsCountChanged = _lastFocusedWindowTabsCount != tabsCount 
                            && tabsCount <= 2;    // We only care about that change if there is a change from a single to multiple tabs and vice versa
        
        return focusChanged || tabsCountChanged;
    },

    saveFocusedWindow: function (window) {
        _lastFocusedWindowId = window.id;
        _lastFocusedWindowTabsCount = window.tabs.length;
    },
}

export { Windows };