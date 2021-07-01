var Mocks = {
    /**
     * Provides an array of mocked objects resembling chrome.windows.Window.
     * 
     * @param {object[]} windowSet - short definitions of windows to mock;
*                       tabCount - number of tabs in the window,
                        focused - if the window is focused,
                        incognito - if the window has incognito tabs
     * @returns 
     */
    getWindows: function (windowSet) {
        let windows = windowSet.map(function (option, idx) {
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
        });
        return windows;
    },
}


function getTabs (option, windowId) {
    let tabs = [];
    for (let i = 1; i <= option.tabCount; i++) {
        tabs.push({
            active: option.focused,
            audible: false,
            autoDiscardable: true,
            discarded: false,
            favIconUrl: "",
            groupId: -1,
            height: 768,
            highlighted: i == 1,    // Let's highlight first tab in the window
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

module.exports = Mocks;