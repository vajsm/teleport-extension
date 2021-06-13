/* 
 * Background scripts that register context menu options upon extension's installation
 * and handle on-click actions for these options.
 */

var _lastFocusedWindowId = -1;

function createContextMenu(options, onItemClickedHandler) {

    let itemKind = options.itemKind;
    let parentId = options.parentId;

    chrome.contextMenus.create({
      id: `contextMenu_${itemKind}`,
      title: chrome.i18n.getMessage(itemKind),
      contexts: ["page", "frame"],
      parentId: parentId,
      onclick(info, tab) {
          onItemClickedHandler(info, tab);
      } 
    }, onItemCreatedHandler);
}

function getAvailableWindows(callback) {
    chrome.windows.getAll({
        "windowTypes": ["normal"]
      }, 
      function(windows) {
        console.log('in a callback');
        callback(windows);
      }
    );

}

function moveTabToWindow(tabId, windowId) {
  // chrome.tabs.move(tabId, {
  //   "index": -1,
  //   "windowId": ???
  // })
}

function onItemCreatedHandler(info, tab) {
    // todo
}

function onTeleportExistingHandler(info, tab) {
    // todo
    console.log(info)
    console.log(tab)

    getAvailableWindows(function(windows) {

      console.log(windows);
      console.log("tab id", tab.id);

      let [target] = windows.filter(function(item) { return !item.focused; }).slice(-1);
      console.log("last window:", target);
      chrome.tabs.move(tab.id, {
       "index": -1,
       "windowId": target.id
      }, function(tabs) { console.log("tabs moved", tabs)})
    });
}

function onTeleportNewHandler(info, tab) {
    console.log(info)
    console.log(tab)

    // todo: get details about the window the tab comes from
    // and open in the very same window (minimized/maximized, size etc.)

    chrome.windows.create({
      "url": tab.url,
      "state": info.state
    }, onWindowCreateHandler);

    chrome.tabs.remove(tab.id, onTabRemovedHandler(tab));

    // todo: maybe it's better to move instead? 
}

function onWindowCreateHandler(window) {
  console.log('window created');
  console.log(window);
}

function onTabRemovedHandler(tab) {
  console.log('tab closed');
  console.log(tab);
}

//chrome.runtime.onInstalled.addListener(
//    createContextMenu({ itemKind:'teleportExisting' }, onTeleportExistingHandler)
//);

//chrome.runtime.onInstalled.addListener(
//    createContextMenu({ itemKind:'teleportNew' }, onTeleportNewHandler)
//);

chrome.runtime.onStartup.addListener(refreshOptions);


chrome.windows.onCreated.addListener(function(window) {
    console.log("a window has been added");
    console.log(window);
    refreshOptions();
  }
)

chrome.windows.onRemoved.addListener(function(windowId) {
  console.log("a window has been removed");
  console.log(windowId);

  // there's no need to refresh - focus needs to change on close anyway
  // unless there's a way to close the window in the background, but I am not aware yet
  // todo: investigate
  //refreshOptions();
  }
)

chrome.windows.onFocusChanged.addListener(function(windowId) {
  console.log("a window has been focused");
  refreshOptions();
}
)

function refreshOptions() {
  getFocusedWindow(function(window) {
    if (_lastFocusedWindowId != window.id) {
      console.log("refreshing; last focused window: ", window);
      chrome.contextMenus.removeAll(() => {
        setContextMenuForWindow(window);
      });
      _lastFocusedWindowId = window.id;
    }
  })
}

function setContextMenuForWindow(window) {
  getAvailableWindows(function(windows) {
    // always create an option to move to a new window
    createContextMenu({ itemKind: 'teleportNew' }, onTeleportNewHandler);

    if (windows.length == 2) {
      // If there are only two windows, then expose an option to move to the another window
      createContextMenu({ itemKind: 'teleportAnother' }, onTeleportExistingHandler);
    }
    else if (windows.length > 2) {
      // TODO if there's more, add another level to the context menu, allowing to select in which window to move
      console.log('i will implement this soon believe me')
    }
  })
}

function getFocusedWindow(callback) {
  chrome.windows.getLastFocused({ 
    "windowTypes": ["normal"]
  }, 
  function(window) {
    callback(window);
  })
}

// TODOs: 
// - if there's a single tab in the window, this is useless - hide the option to move to a new window
// - implement listing windows in the context menu (if there are more than two windows)
// - implement options page
//    Allow to control:
//    * the position where the page should be transferred to (beginning/end)
//    * if the incognito tabs should be allowec to be moved
// - implement the popup
// - address the TODOs in code
// - refactor, summaries, logs, docs
// - texts and translations
// - icons
// - packaging