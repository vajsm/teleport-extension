/* 
 * Background scripts that register context menu options upon extension's installation
 * and handle on-click actions for these options.
 */

function createContextMenu(itemKind, onItemClickedHandler) {
    chrome.contextMenus.create({
      "id": `contextMenu_${itemKind}`,
      "title": chrome.i18n.getMessage(itemKind),
      "contexts": ["page", "frame"],
      onclick(info, tab) {
          onItemClickedHandler(info, tab);
      } 
    }, onItemCreatedHandler);
}

function onItemCreatedHandler(info, tab) {
    // todo
}

function onTeleportExistingHandler(info, tab) {
    // todo
}

function onTeleportNewHandler(info, tab) {
    // todo
}

chrome.runtime.onInstalled.addListener(
    createContextMenu('teleportExisting', onTeleportExistingHandler)
);
chrome.runtime.onInstalled.addListener(
    createContextMenu('teleportNew', onTeleportNewHandler)
);
