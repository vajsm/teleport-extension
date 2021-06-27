import { Windows } from './windows.js'

// todo: config file
const WIN_ID_NEW = "tabToNewWindow";
const WIN_ID_ANOTHER = "tabToAnotherWindow";
const WIN_ID_SELECT = "tabToSelectWindow";

var Teleport = {
    /**
     * Constructs a set of all available targets to be created in the context menu. 
     * @param {*} windows 
     * @returns 
     */
    getAvailableTargets: function (focused, windows) {
        const targets = SupportedTargets.filter(x => x.isAvailable(focused, windows));
        let anotherEntry = targets.find(x => x.id == WIN_ID_ANOTHER);
        let selectEntry = targets.find(x => x.id == WIN_ID_SELECT);

        if (anotherEntry != null) {
            // Update target window's id
            let anotherWindow = windows.find(x => x.id != focused.id);
            anotherEntry.options = {
                targetWindowId: anotherWindow.id
            };
        }
        if (selectEntry != null) { 
            // Add child tabs under "teleport to..." option
            windows.filter(x => x.id != focused.id).forEach((window, idx) => {
                const child = createChildTarget(window, WIN_ID_SELECT, idx);
                targets.push(child);
            });
        }
        console.log("available targets", targets);
        return targets;
    },
};

// todo: consider remove onCreateEntry
const SupportedTargets = [
    {
        id: WIN_ID_NEW,
        title: chrome.i18n.getMessage(WIN_ID_NEW),
        options: {},
        onCreateEntry: function() {},
        onClickEntry: onTeleportNew,
        isAvailable(focused, windows) {
            // This option only makes sense if there's at least two tabs in the window;
            // otherwise we would create a new window while destroying the old one
            return focused.tabs ? focused.tabs.length > 1 : false;
        }
    },
    {
        id: WIN_ID_ANOTHER,
        title: chrome.i18n.getMessage(WIN_ID_ANOTHER),
        options: {},
        onCreateEntry: function() {},
        onClickEntry: onTeleportExisting,
        isAvailable(focused, windows) {
            // If there are precisely two windows, we immediately can determine the target
            // for teleport (other than a new window)
            return windows.filter(x => x.tabs.length > 0).length == 2;
        }
    },
    {
        id: WIN_ID_SELECT,
        title: chrome.i18n.getMessage(WIN_ID_SELECT),
        options: {},
        onCreateEntry: function() {},
        onClickEntry: onTeleportExisting,
        isAvailable(focused, windows) {
            // If there are precisely two windows, we immediately can determine the target
            // for teleport (other than a new window)
            return windows.length > 2;
        }
    }
];

function createChildTarget (window, parentId, idx) {

    const childId = `${parentId}_${window.id}`;
    const title = Windows.getName(window, idx);
    const options = {
        targetWindowId: window.id
    };
    return {
        id: childId,
        title: title,
        parentId: parentId,
        options: options,
        onCreateEntry: function() {},
        onClickEntry: onTeleportExisting,
        isAvailable(focused, windows) {
            return windows.find(x => x.id == id) != null;
        }
    }
}

function onTeleportNew (info, tab) {
    // Create an empty window first and then move a tab there.
    // There doesn't seem to be a way to move the tab in a single step. 
    // Using 'url' property is not the same -- it will not persist state.
    chrome.windows.create({
        "url": null,
        "state": info.state
    }, function(window) {
        const defaultTabId = window.tabs[0].id;
        chrome.tabs.move(tab.id, {
            "index": -1,
            "windowId": window.id
        }, function(tabs) { 
            chrome.tabs.remove(defaultTabId, function() {
        })});
    });
}

function onTeleportExisting (info, tab) {
    const targetId = this.options.targetWindowId;
    chrome.tabs.move(tab.id, {
        "index": -1, // todo: implement the selection of tab's position in the window
        "windowId": targetId
    }, () => {});
}

export { Teleport };