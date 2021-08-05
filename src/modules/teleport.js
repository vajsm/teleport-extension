const Windows = require('./windows.js');
const Options = require('./options.js').Options;
const OptionsEnum = require('./options.js').OptionsEnum;
const Localization = require('./localization.js');

const WIN_ID_NEW = "tabToNewWindow";
const WIN_ID_ANOTHER = "tabToAnotherWindow";
const WIN_ID_SELECT = "tabToSelectWindow";
const WIN_ID_ALL_ANOTHER = "allTabsToAnotherWindow";
const WIN_ID_ALL_SELECT = "allTabsToSelectWindow";

/**
 * This enum represents the kind of target window option.
 */
const TargetWindowEnum = {
    /**
     * Represents an option to teleport to a new window.
     */
    new: "new",
    /**
     * Represents an option to teleport to another window.
     */
    another: "another",
    /**
     * Represents an option to teleport to one of the other windows.
     */
    select: "select"
}
Object.freeze(TargetWindowEnum);

/**
 * Returns definitions of all the teleport targets that the extension supports,
 * along with the rules responsible for showing the options in the context menu.
 */
// The array must be created at runtime due to the temporary nature of background service workers
// eslint-disable-next-line max-lines-per-function
async function getSupportedTargets() {
    return [
        {
            id: WIN_ID_NEW,
            title: await Localization.getMessage(WIN_ID_NEW),
            options: {
                allTabs: false,
                targetWindow: TargetWindowEnum.new
            },
            onClickEntry: onTeleportNew,
            isAvailable(focused, windows) {
                // This option only makes sense if there's at least two tabs in the window;
                // otherwise we would create a new window while destroying the old one
                return focused.tabs ? focused.tabs.length > 1 : false;
            }
        },
        {
            id: WIN_ID_ANOTHER,
            title: await Localization.getMessage(WIN_ID_ANOTHER),
            options: {
                allTabs: false,
                targetWindow: TargetWindowEnum.another
            },
            onClickEntry: onTeleportExisting,
            isAvailable(focused, windows) {
                // If there are precisely two windows, we immediately can determine the target
                // for teleport (other than a new window)
                return windows.filter(x => x.tabs.length > 0).length == 2;
            }
        },
        {
            id: WIN_ID_SELECT,
            title: await Localization.getMessage(WIN_ID_SELECT),
            options: {
                allTabs: false,
                targetWindow: TargetWindowEnum.select
            },
            onClickEntry: onTeleportExisting,
            isAvailable(focused, windows) {
                return windows.length > 2;
            }
        },
        {
            id: WIN_ID_ALL_ANOTHER,
            title: await Localization.getMessage(WIN_ID_ALL_ANOTHER),
            options: {
                allTabs: true,
                targetWindow: TargetWindowEnum.another
            },
            onClickEntry: onTeleportExisting,
            isAvailable(focused, windows) {
                // If there are precisely two windows, we immediately can determine the target
                // for teleport (other than a new window)

                // todo: disable/enable this option based on user's choice
                return focused.tabs.length > 1
                    && windows.filter(x => x.tabs.length > 0).length == 2;
            }
        },
        {
            id: WIN_ID_ALL_SELECT,
            title: await Localization.getMessage(WIN_ID_ALL_SELECT),
            options: {
                allTabs: true,
                targetWindow: TargetWindowEnum.select
            },
            onClickEntry: onTeleportExisting,
            isAvailable(focused, windows) {
                // todo: disable/enable this option based on user's choice
                return focused.tabs.length > 1 
                    && windows.length > 2;
            }
        }
    ];
}

/**
 * Creates an option in the context menu under a given parent. 
 * 
 * @param {chrome.windows.Window} window - the target window
 * @param {number} parentId - ID of the parent option (not the window)
 * @param {number} idx - human-friendly index of the target window to be displayed on the list
 * @returns 
 */
function createChildTarget(window, parentId, idx) {
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
        onClickEntry: onTeleportExisting,
        isAvailable(focused, windows) {
            return windows.find(x => x.id == childId) != null;
        }
    }
}

/**
 * Callback fired when user selects the "teleport to a new page" option.
 * 
 * @param {chrome.contextMenus.OnClickData} info 
 * @param {chrome.tabs.Tab} tab 
 */
async function onTeleportNew(info, tab) {
    console.log("Teleporting to a new window", info, tab);
    // Create an empty window first and then move a tab there.
    // There doesn't seem to be a way to move the tab in a single step. 
    // Using 'url' property is not the same -- it will not persist state.
    let window = await chrome.windows.create({
        "url": null,
        "state": info.state
    });
    await chrome.tabs.move(tab.id, {
        "index": -1,
        "windowId": window.id
    });
    await chrome.tabs.remove(window.tabs[0].id);
}

/**
 * Callback fired when user selects an option teleporting to one of the other windows.
 * 
 * @param {chrome.contextMenus.OnClickData} info 
 * @param {chrome.tabs.Tab} tab 
 */
async function onTeleportExisting(info, tab) {
    const targetId = this.options.targetWindowId;
    const teleportAllTabs = this.options.allTabs;

    console.log("Teleporting to an existing window", info, tab);
    
    let position = (await Options.get(OptionsEnum.position)).selectedValue;
    let tabsToMove = teleportAllTabs ? this.options.tabs : [tab];

    await Promise.all(tabsToMove.map(async function(x) {
        await chrome.tabs.move(x.id, {
            "index": position == "end" ? -1 : 0,
            "windowId": targetId
        })
    }));
}

/**
 * Module responsible for defining the targets for teleport
 * and handling tab teleportation.
 */
var Teleport = {
    /**
     * Constructs a set of all available targets to be created in the context menu. 
     * 
     * @param {chrome.windows.Window} focused
     * @param {chrome.windows.Window[]} windows 
      * @returns {Promise<Target[]>} options to be created in the context menu
     */
    getAvailableTargets: async function(focused, windows) {
        let targets = await getSupportedTargets();
        let allowIncognito = (await Options.get(OptionsEnum.incognito)).selectedValue == "yes";

        if (!allowIncognito) {
            console.log("Filtering out incognito windows");
            windows = windows.filter(x => x.id == focused.id || !x.incognito);
        }
        
        let anotherWindow = windows.find(x => x.id != focused.id);
        targets = targets.filter(x => x.isAvailable(focused, windows));
        
        targets.forEach(function(target) {
            let targetWindow = target.options.targetWindow;
            switch (targetWindow) {
            case TargetWindowEnum.another:
                target.options.targetWindowId = anotherWindow.id;
                break;
            case TargetWindowEnum.select:
                windows.filter(x => x.id != focused.id).forEach((window, idx) => {
                    let child = createChildTarget(window, target.id, idx);
                    console.log("child created", child);
                    targets.push(child);
                });
                break;
            case TargetWindowEnum.new:
            default: 
                break;
            }

            if (target.options.allTabs) {
                target.options.tabs = focused.tabs;
            }
        });
        return targets;
    }
};
module.exports = Teleport;