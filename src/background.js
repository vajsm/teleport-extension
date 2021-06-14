/* 
 * Background scripts that register context menu options upon extension's installation
 * and handle on-click actions for these options.
 */

var _lastFocusedWindowId = -1;
var _lastFocusedWindowTabsCount = -1;

function createContextMenu(options, onItemClicked, onItemCreated) {

    let parentId = options.parentId;
    let itemId = options.itemId;
    let itemTitle = options.title ?? chrome.i18n.getMessage(itemId);

    console.log('Adding item', `itemId: ${itemId}`, `parentId: ${parentId}`, `itemTitle: ${itemTitle}`);

    chrome.contextMenus.create({
      id: itemId,
      title: itemTitle,
      contexts: ["page", "frame"],
      parentId: parentId,
      onclick(info, tab) {
          onItemClicked(info, tab, options);
      } 
    }, onItemCreated);
}

function getAvailableWindows(callback) {
    chrome.windows.getAll({
        "windowTypes": ["normal"]
      }, 
      function(windows) {
        callback(windows);
      }
    );
}

function onTeleportExisting(info, tab, options) {
    getAvailableWindows(function(windows) {
      const targetId = options.targetId ?? windows.find(function(item) { return !item.focused; }).id;
      chrome.tabs.move(tab.id, {
       "index": -1, // todo: implement the selection of tab's position in the window
       "windowId": targetId
      }, function(tabs) { console.log("tabs moved", tabs)})
    });
}

function onTeleportNew(info, tab, options) {
    // todo: get details about the window the tab comes from
    // and open in the very same window (minimized/maximized, size etc.)

    chrome.windows.create({
      "url": null,
      "state": info.state
    }, function(window) {

      const defaultTabId = window.tabs[0].id;

      chrome.tabs.move(tab.id, {
        "index": -1,
        "windowId": window.id
      }, function(tabs) { 
        console.log("tabs moved", tabs);

        chrome.tabs.remove(defaultTabId, function() {

        });
      })
    });
}

chrome.runtime.onInstalled.addListener(refreshOptions);
chrome.runtime.onStartup.addListener(refreshOptions);

chrome.tabs.onCreated.addListener(refreshOptions);
chrome.tabs.onRemoved.addListener(refreshOptions);

chrome.windows.onCreated.addListener(refreshOptions);
chrome.windows.onFocusChanged.addListener(refreshOptions);

function refreshOptions() {

  function shouldRefreshOptions(window) {
    const tabsCount = window.tabs.length;

    var focusChanged = _lastFocusedWindowId != window.id;
    var tabsCountChanged = _lastFocusedWindowTabsCount != tabsCount 
                        && tabsCount <= 2;  // we only care about the change if there is a change from a single to multiple tabs and vice versa
    
    return focusChanged || tabsCountChanged;
  }

  getFocusedWindow(function(window) {
    if (shouldRefreshOptions(window)) {
      console.log("refreshing; last focused window: ", window);
      chrome.contextMenus.removeAll(() => {
        setContextMenuForWindow(window);
      });
      _lastFocusedWindowId = window.id;
      _lastFocusedWindowTabsCount = window.tabs.length;
    }
  }, { "populate": true })
}

function setContextMenuForWindow(window) {
  getAvailableWindows(function(windows) {
    
    if (window.tabs.length > 1) {
      // create an option to move to a new window if there's more than one tab in the window
      // - otherwise this option makes no sense
      createContextMenu({ itemId: 'teleportNew' }, onTeleportNew);
    }

    if (windows.length == 2) {
      // If there are only two windows, then expose an option to move to the another window
      createContextMenu({ itemId: 'teleportAnother' }, onTeleportExisting);
    }
    else if (windows.length > 2) {
      // If there's more, add another level to the context menu, allowing to select in which window to move
      createContextMenu({ itemId: 'teleportSelect' },
      () => {},
      () => {
        windows.filter(x => { 
          return x.id != _lastFocusedWindowId 
        })
        .forEach(x => {
          createContextMenu({ 
            itemId: `teleportSelect_${x.id}`,
            parentId: 'teleportSelect',
            title: getWindowName(x),
            targetId: x.id
          }, onTeleportExisting);
        })
      });
    }
  })
}

function getWindowName(window) {
  // todo: improve naming based on the selected tab in window
  // https://developer.chrome.com/docs/extensions/reference/tabs/#method-getSelected
  return `Window nr: ${window.id}`;
}

function getFocusedWindow(callback, options = {}) {
  chrome.windows.getLastFocused({ 
    "windowTypes": ["normal"],
    "populate": options.populate ?? false
  }, 
  function(window) {
    callback(window);
  })
}

// TODOs: 
// - if there's more than one option in context menu, name it "teleport tab" instead of a default "teleport extension"
// - implement options page
//    Allow to control:
//    * the position where the page should be transferred to (beginning/end)
//    * if the incognito tabs should be allowec to be moved
// - implement the popup
// - address the TODOs in code
// - refactor, summaries, logs, docs
// - texts and translations
// - icons
// - packaging; build; webpack
// todo: handle 'no last focused' error
// todo: move to manifest v3 and promises when possible