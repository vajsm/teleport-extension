const Windows = require('./windows.js');
const Teleport = require('./teleport.js');

/**
 * Based on the current state of windows and their tabs,
 * creates Teleport entries to show for the current (focused) window. 
 * 
 * @param {chrome.windows.Window} focused - the window that's currently focused
 * @param {chrome.windows.Window[]} all - all open (regular) windows 
 */
function createTeleportEntries (focused, all) { 
    Teleport.getAvailableTargets(focused, all).forEach(function (target) {
        createEntry(target);
    });
};

/**
 * Creates an entry for given Teleport target. 
 * 
 * @param {Target} target - the details of a target window (the window where the tab will be moved)
 */
function createEntry (target) {
    chrome.contextMenus.create({
        id: target.id,
        title: target.title,
        parentId: target.parentId,
        contexts:  [ "page", "frame" ],
        onclick(info, tab) {
            target.onClickEntry(info, tab);
        } 
    }, target.onCreateEntry);
};

/**
 * Clears all the entries in the context menu.
 * 
 * @param {*} callback - this callback is called after clearing all entries in the context menu
 */
function clear (callback) {
    chrome.contextMenus.removeAll(callback);
};

/**
 * Callback fired on refresh, when all windows and a focused window were determined.
 * 
 * @param {chrome.windows.Window} focused - the window that's currently focused
 * @param {chrome.windows.Window[]} all - all open (regular) windows 
 */
function onRefresh (focused, all) {
    if (Windows.isRefreshRequired(focused)) {
        clear(_ => createTeleportEntries(focused, all));
        Windows.saveFocusedWindow(focused);
    }
}

/**
 * Module responsible for displaying the proper options
 * in Teleport context menu for the focused window.
 */
var ContextMenu = {
    /**
     * Based on the current state of windows and their tabs, 
     * determines if the context menu needs to be refreshed, 
     * and repopulates the entries if it does. 
     */
     refresh: function () {
        Windows.getAll(all => {
            Windows.getFocused(focused => onRefresh(focused, all));
        });
    }
};
module.exports = ContextMenu;