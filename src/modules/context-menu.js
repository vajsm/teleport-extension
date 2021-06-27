import { Windows } from './windows.js';
import { Teleport } from './teleport.js';

/**
 * Based on the current state of windows and their tabs,
 * creates Teleport entries to show for the current (focused) window. 
 * 
 * @param {*} all 
 */
function createTeleportEntries (focused, all) { // todo: can remove focused?
    Teleport.getAvailableTargets(focused, all).forEach(function (target) {
        createEntry(target);
    });
};

/**
 * Creates an entry for given Teleport target. 
 * 
 * @param {Target} target 
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
 * This callback is called after clearing all entries in the context menu.
 * 
 * @callback clearCallback
 */
/**
 * Clears all the entries in the context menu.
 * 
 * @param {clearCallback} callback 
 */
function clear (callback) {
    chrome.contextMenus.removeAll(callback);
};

var module = {
    /**
     * Based on the current state of windows and their tabs, 
     * determines if the context menu needs to be refreshed, 
     * and repopulates the entries if it does. 
     */
     refresh: function () {
        Windows.getAll(all => {
            Windows.getFocused (focused => {
                if (Windows.isRefreshRequired(focused)) {
                    clear(_ => createTeleportEntries(focused, all));
                    Windows.saveFocusedWindow(focused);
                }
            });
        });
    }
};

export default module;