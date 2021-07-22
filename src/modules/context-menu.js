const Windows = require('./windows.js');
const Teleport = require('./teleport.js');

/**
 * 
 * @returns 
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
 * @param {chrome.windows.Window} focused - the window that's currently focused
 * @param {chrome.windows.Window[]} all - all open (regular) windows 
 */
function createTeleportEntries (targets) { 
    targets.forEach(function (target) {
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
        contexts:  [ "page", "frame" ]
    });
};

/**
 * Clears all the entries in the context menu.
 */
async function clear() {
    return chrome.contextMenus.removeAll();
};

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
     refresh: async function () {
        let [focused, targets] = await getFocusedWindowTargets();
        if (await Windows.isRefreshRequired(focused)) {
            await clear();
            createTeleportEntries(targets);
            Windows.saveFocusedWindow(focused);
        }
    },
    
    /**
     * 
     * @param {*} info 
     * @param {*} tab 
     * @returns 
     */
    onClicked: async function (info, tab) {
        const menuItemId = info.menuItemId;
        let [_, targets] = await getFocusedWindowTargets();
        let target = targets.find(x => x.id == menuItemId);
        return target.onClickEntry(info, tab);
    }
};
module.exports = ContextMenu;