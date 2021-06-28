import assert from 'assert';
import chrome from 'sinon-chrome/extensions'

describe ('Teleport module: getAvailableTargets', function() {

    let Teleport;
    let Mocks;

    this.beforeAll(() => {
        global.chrome = chrome;
        Teleport = require("../teleport.js");
        Mocks = require("./mocks.js");
    });

    it ('has no targets', function() {
        let windows = Mocks.getWindows([
            { tabCount: 1, focused: true, incognito: false }
        ]);
        let focused = windows.find(x => x.focused);

        let result = Teleport.getAvailableTargets(focused, windows);

        assert(Array.isArray(result));
        assert(result.length == 0);
    });

    it ('has targets: [tabToNewWindow]', function() {
        let windows = Mocks.getWindows([
            { tabCount: 2, focused: true, incognito: false }
        ]);
        let focused = windows.find(x => x.focused);

        let result = Teleport.getAvailableTargets(focused, windows);

        assert(Array.isArray(result));
        assert(result.length == 1);
        assert(result[0].id == "tabToNewWindow");
    });

    it ('has targets: [tabToNewWindow|tabToAnotherWindow]', function() {
        let windows = Mocks.getWindows([
            { tabCount: 1, focused: false, incognito: false },
            { tabCount: 2, focused: true, incognito: false }
        ]);
        let focused = windows.find(x => x.focused);

        let result = Teleport.getAvailableTargets(focused, windows);

        assert(Array.isArray(result));
        assert(result.length == 2);
        assert(result.some(x => x.id == "tabToNewWindow"));
        assert(result.some(x => x.id == "tabToAnotherWindow"));
    });

    it ('has targets: [tabToAnotherWindow]', function() {
        let windows = Mocks.getWindows([
            { tabCount: 1, focused: false, incognito: false },
            { tabCount: 1, focused: true, incognito: false }
        ]);
        let focused = windows.find(x => x.focused);

        let result = Teleport.getAvailableTargets(focused, windows);

        assert(Array.isArray(result));
        assert(result.length == 1);
        assert(result[0].id == "tabToAnotherWindow");
    });

    it ('has targets: [tabToSelectWindow]', function() {
        let windows = Mocks.getWindows([
            { tabCount: 3, focused: false, incognito: false },
            { tabCount: 7, focused: false, incognito: true },
            { tabCount: 1, focused: true, incognito: false },
        ]);
        let focused = windows.find(x => x.focused);

        let result = Teleport.getAvailableTargets(focused, windows);

        assert(Array.isArray(result));
        assert(result.length == windows.length);    // Another two windows + one parent entry
        assert(result.every(x => x.id.startsWith("tabToAnotherWindow")));
    });

    it ('has targets: [tabToNewWindow|tabToSelectWindow]', function() {
        let windows = Mocks.getWindows([
            { tabCount: 3, focused: false, incognito: false },
            { tabCount: 7, focused: false, incognito: true },
            { tabCount: 3, focused: true, incognito: false },
        ]);
        let focused = windows.find(x => x.focused);

        let result = Teleport.getAvailableTargets(focused, windows);

        assert(Array.isArray(result));
        assert(result.length == windows.length + 1);    // Another two windows + one parent entry + 'to new window' entry
        assert(result.some(x => x.id == "tabToNewWindow"));
        assert(result.filter(x => x.id.startsWith("tabToAnotherWindow")).length == windows.length);
    });

    this.afterAll(() => {
        chrome.flush();
    });
});