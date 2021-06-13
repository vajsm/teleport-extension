/* 
 * Background scripts that register context menu options upon extension's installation
 * and handle on-click actions for these options.
 */

var _lastFocusedWindowId = -1;

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
          onItemClicked(info, tab);
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

function onTeleportExisting(info, tab) {
    getAvailableWindows(function(windows) {
      // todo: implement the actual id of the target window if there are more than 2 windows
      let [target] = windows.filter(function(item) { return !item.focused; }).slice(-1);
      chrome.tabs.move(tab.id, {
       "index": -1, // todo: implement the selection of tab's position in the window
       "windowId": target.id
      }, function(tabs) { console.log("tabs moved", tabs)})
    });
}

function onTeleportNew(info, tab) {
    // todo: get details about the window the tab comes from
    // and open in the very same window (minimized/maximized, size etc.)

    chrome.windows.create({
      "url": tab.url,
      "state": info.state
    }, onWindowCreated);
    chrome.tabs.remove(tab.id, onTabRemoved(tab));
    // todo: maybe it's better to move in a single step instead? 
}

function onWindowCreated(window) {
  console.log('window created');
  console.log(window);
}

function onTabRemoved(tab) {
  console.log('tab closed');
  console.log(tab);
}

chrome.runtime.onInstalled.addListener(refreshOptions);
chrome.runtime.onStartup.addListener(refreshOptions);

chrome.windows.onCreated.addListener(function(window) {
    console.log("a window has been added");
    console.log(window);
    refreshOptions();
  }
)

// chrome.windows.onRemoved.addListener(function(windowId) {
//   console.log("a window has been removed");
//   console.log(windowId);

//   // there's no need to refresh - focus needs to change on close anyway
//   // unless there's a way to close the window in the background, but I am not aware yet
//   // todo: investigate
//   //refreshOptions();
//   }
// )

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
    createContextMenu({ itemId: 'teleportNew' }, onTeleportNew);

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
            title: getWindowName(x)
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
// - packaging
// todo: handle 'no last focused' error