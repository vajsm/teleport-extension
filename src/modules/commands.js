const Teleport = require('./teleport.js');
const Windows = require('./windows.js');

/**
 * Represents the commands registered by the extension.
 */
const CommandsEnum = {
    /**
     * Shortcut that teleports the tab to a new window.
     */
    tabToNewWindow: "tab_to_new_window",
    /**
     * Shortcut that teleports the tab to another (existing) window.
     */
    tabToAnotherWindow: "tab_to_another_window",
    /**
     * Shortcut that teleports all the tabs to another (existing) window.
     */
    allTabsToAnotherWindow: "all_tabs_to_another_window" 
}
Object.freeze(CommandsEnum);


/**
 * Module responsible for handling keyboard shortcuts.
 */
var Command = {
    onCommand: async function(command) {

        const [focused, all] = await Promise.all([
            Windows.getFocused(),
            Windows.getAll()
        ]); 
        
        let targets = await Teleport.getAvailableTargets(focused, all);
        let commandKey = Object.keys(CommandsEnum).find(key => CommandsEnum[key] == command);
        let commandTarget = targets.find(x => x.id === commandKey);
        let isTargetSupported = commandTarget != null;

        if (isTargetSupported) {
            let focusedTab = focused.tabs.find(x => x.highlighted);
            commandTarget.onClickEntry(null, focusedTab);
        }
    }
};
module.exports = Command;