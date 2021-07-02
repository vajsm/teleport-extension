/**
 * A helper method to create a mock of chrome.windows.Window.
 * @param {object} option - short definitions of a window to mock
 * @param {number} idx - index of the window
 * @returns 
 */
function getIndexedWindow (option, idx) {
    let windowId = idx + 1;
    return {
        alwaysOnTop: false,
        focused: option.focused,
        height: 768,
        id: windowId,
        incognito: option.incognito,
        left: 0,
        sessionId: windowId,
        state: "normal",
        tabs: getTabs(option, windowId),
        top: 0,
        type: "normal",
        width: 1366
    };
}

/**
 * A helper method to create a mock of a window's tabs.
 * @param {object} option - short definitions of a window to mock
 * @param {number} windowId - index of the window
 * @returns 
 */
function getTabs (option, windowId) {
    let tabs = [];
    let tabOptions = option.tabOptions;
    let highlighted = tabOptions.highlighted ?? true;   // By default there is a highlighted tab

    for (let i = 1; i <= tabOptions.tabCount; i++) {
        tabs.push({
            active: option.focused,
            audible: false,
            autoDiscardable: true,
            discarded: false,
            favIconUrl: "",
            groupId: -1,
            height: 768,
            highlighted: highlighted && i == 1,    // Let's highlight first tab in the window
            id: i,
            incognito: option.incognito,
            index: i,
            mutedInfo: { muted: false },
            pinned: false,
            selected: true,
            status: "complete",
            title: `Tab ${i}`,
            url: "",
            width: 1366,
            windowId: windowId
        });
    }
    return tabs;
}

var Mocks = {
    /**
     * Provides an array of mocked objects resembling chrome.windows.Window.
     * 
     * @param {object[]} windowOptionsSet - short definitions of windows to mock;
     *                   tabCount - number of tabs in the window,
     *                   focused - if the window is focused,
     *                   incognito - if the window has incognito tabs
     * @returns a set of mocked windows
     */
    getWindows: function (windowOptionsSet) {
        let windows = windowOptionsSet.map(getIndexedWindow);
        return windows;
    },

    /**
     * Provides a mocked object resembling chrome.windows.Window.
     * 
     * @param {*} windowOptions - short definitions of a window to mock;
     *                   tabCount - number of tabs in the window,
     *                   focused - if the window is focused,
     *                   incognito - if the window has incognito tabs
     * @returns a mocked window
     */
    getWindow: function (windowOptions) {
        let window = getIndexedWindow(windowOptions, 0);
        return window;
    }
}
module.exports = Mocks;