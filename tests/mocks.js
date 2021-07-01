var Mocks = {
    /**
     * Provides an array of mocked objects resembling chrome.windows.Window.
     * 
     * @param {object[]} options - short definitions of windows to mock
     * @returns 
     */
    getWindows: function (options) {
        var windows = options.map(function (option, idx) {
            return {
                alwaysOnTop: false,
                focused: option.focused,
                height: 1366,
                id: idx + 1,
                incognito: option.incognito,
                left: 0,
                sessionId: idx + 1,
                state: "normal",
                tabs: getTabs(options.tabCount),
                top: 0,
                type: "normal",
                width: 768
            };
        });
        return windows;
    },

    getTabs: function (tabCount) {
        // todo: return tabs
    }
}
module.exports = Mocks;