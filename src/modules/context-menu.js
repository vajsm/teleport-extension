const Windows = require('./windows.js');
const Teleport = require('./teleport.js');

/**
 * Returns the details about currently focused window and its 
 * Teleport context menu targets.
 */
async function getFocusedWindowTargets() {
    const [focused, all] = await Promise.all([
        Windows.getFocused(),
        Windows.getAll()
    ]); 
    let targets = await Teleport.getAvailableTargets(focused, all);
    return [focused, targets];
}

/**
 * Based on the current state of windows and their tabs,
 * creates Teleport entries to show for the current (focused) window. 
 * 
 * @param {*[]} targets 
 */
function createTeleportEntries(targets) { 
    console.log("Creating context menu options", targets);
    targets.forEach(function (target) {
        createEntry(target);
    });
}

/**
 * Creates an entry for given Teleport target. 
 * 
 * @param {*} target - the details of a target window (the window where the tab will be moved)
 */
function createEntry(target) {
    chrome.contextMenus.create({
        id: target.id,
        title: target.title,
        parentId: target.parentId,
        contexts:  [ "page", "frame" ]
    });
}

/**
 * Clears all the entries in the context menu.
 */
async function clear() {
    console.log("Clearing context menu entries");
    return chrome.contextMenus.removeAll();
}

var refreshInProgress = false;

/**
 * Repopulates the entries if the current state of windows/tabs indicates
 * the need for such action, or if `force` parameter is `true`. 
 * @param {*} force 
 */
async function refresh(force = false) {
    if (refreshInProgress) {
        return;
    }
    refreshInProgress = true;
    let [focused, targets] = await getFocusedWindowTargets();
    if (force || await Windows.isRefreshRequired(focused)) {
        console.log("Refresh required", force ? "(forced)" : "");
        await clear();
        createTeleportEntries(targets);
        await Windows.saveFocusedWindow(focused);
    }
    refreshInProgress = false;
}

/**
 * Module responsible for displaying the proper options
 * in Teleport context menu for the focused window
 * and handling the associated actions.
 */
var ContextMenu = {
    /**
     * Based on the current state of windows and their tabs, 
     * determines if the context menu needs to be refreshed, 
     * and repopulates the entries if it does. 
     */
    refresh: async function() {
        await refresh();
    },
    
    /**
     * Repopulates the entries in the context menu regardless 
     * of the current state of windows/tabs.
     */
    forceRefresh: async function() {
        await refresh(true);
    },

    /**
     * Callback for when an option in the context menu is clicked.
     * Handles the actions associated with the clicked option.
     * @param {*} info - event args - details about the clicked menu item
     * @param {*} tab - event args - details about the current tab
     */
    onClicked: async function(info, tab) {
        const menuItemId = info.menuItemId;
        let [_, targets] = await getFocusedWindowTargets();
        let target = targets.find(x => x.id == menuItemId);
        return target.onClickEntry(info, tab);
    }
};
module.exports = ContextMenu;