import "core-js/stable";
import "regenerator-runtime/runtime";
import assert from 'assert';
import chrome from 'sinon-chrome/extensions';

describe ('Teleport module: getAvailableTargets', function() {

    let Options, Teleport, Mocks;

    this.beforeAll(() => {
        global.chrome = chrome;
    
        Options = require("../src/modules/options.js").Options;
        Teleport = require("../src/modules/teleport.js");
        Mocks = require("./mocks.js");
    });

    this.beforeEach(() => {
        Mocks.setupStorage();
        Options.setDefaults();
    });
    
    it ('has no targets', async function() {
        let windows = Mocks.getWindows([
            { focused: true, incognito: false, tabOptions: { tabCount: 1 } }
        ]);
        let focused = windows.find(x => x.focused);

        let result = await Teleport.getAvailableTargets(focused, windows);

        assert(Array.isArray(result));
        assert(result.length == 0);
    });

    it ('has targets: [tabToNewWindow]', async function() {
        let windows = Mocks.getWindows([
            { focused: true, incognito: false, tabOptions: { tabCount: 2 } }
        ]);
        let focused = windows.find(x => x.focused);

        let result = await Teleport.getAvailableTargets(focused, windows);

        assert(Array.isArray(result));
        assert(result.length == 1);
        assert(result[0].id == "tabToNewWindow");
    });

    it ('has targets: [tabToNewWindow|tabToAnotherWindow]', async function() {
        let windows = Mocks.getWindows([
            { focused: false, incognito: false, tabOptions: { tabCount: 1 } },
            { focused: true, incognito: false, tabOptions: { tabCount: 2 } }
        ]);
        let focused = windows.find(x => x.focused);

        let result = await Teleport.getAvailableTargets(focused, windows);

        assert(Array.isArray(result));
        assert(result.length == 2);
        assert(result.some(x => x.id == "tabToNewWindow"));
        assert(result.some(x => x.id == "tabToAnotherWindow"));
    });

    it ('has targets: [tabToAnotherWindow]', async function() {
        let windows = Mocks.getWindows([
            { focused: false, incognito: false, tabOptions: { tabCount: 1 } },
            { focused: true, incognito: false, tabOptions: { tabCount: 1 } }
        ]);
        let focused = windows.find(x => x.focused);

        let result = await Teleport.getAvailableTargets(focused, windows);

        assert(Array.isArray(result));
        assert(result.length == 1);
        assert(result[0].id == "tabToAnotherWindow");
    });

    it ('has targets: [tabToSelectWindow]', async function() {
        let windows = Mocks.getWindows([
            { focused: false, incognito: false, tabOptions: { tabCount: 3 } },
            { focused: false, incognito: true, tabOptions: { tabCount: 7 } },
            { focused: true, incognito: false, tabOptions: { tabCount: 1 } },
        ]);
        let focused = windows.find(x => x.focused);

        let result = await Teleport.getAvailableTargets(focused, windows);

        assert(Array.isArray(result));
        assert(result.length == windows.length);    // Another two windows + one parent entry
        assert(result.every(x => x.id.startsWith("tabToSelectWindow")));
    });

    it ('has targets: [tabToNewWindow|tabToSelectWindow]', async function() {
        let windows = Mocks.getWindows([
            { focused: false, incognito: false, tabOptions: { tabCount: 3 } },
            { focused: false, incognito: true, tabOptions: { tabCount: 7 } },
            { focused: true, incognito: false, tabOptions: { tabCount: 3 } },
        ]);
        let focused = windows.find(x => x.focused);

        let result = await Teleport.getAvailableTargets(focused, windows);

        assert(Array.isArray(result));
        assert(result.length == windows.length + 1);    // Another two windows + one parent entry + 'to new window' entry
        assert(result.some(x => x.id == "tabToNewWindow"));
        assert(result.filter(x => x.id.startsWith("tabToSelectWindow")).length == windows.length);
    });

    this.afterEach(() => {
        Mocks.restoreStorage();
    });

    this.afterAll(() => {
        chrome.flush();
    });
});


describe ('Teleport module: getAvailableTargets -- custom options', function() {

    let Teleport, Options, OptionsEnum, Mocks;

    this.beforeAll(() => {
        global.chrome = chrome;
    
        Options = require("../src/modules/options.js").Options;
        OptionsEnum = require("../src/modules/options.js").OptionsEnum;
        Teleport = require("../src/modules/teleport.js");
        Mocks = require("./mocks.js");
    });

    this.beforeEach(() => {
        Mocks.setupStorage();
        Options.setDefaults();
    });
    
    it ('allows incognito targets -- has targets: [tabToAnotherWindow]', async function() {
        await Options.set(OptionsEnum.incognito, "yes");

        let windows = Mocks.getWindows([
            { focused: false, incognito: true, tabOptions: { tabCount: 7 } },
            { focused: true, incognito: false, tabOptions: { tabCount: 1 } },
        ]);
        let focused = windows.find(x => x.focused);

        let result = await Teleport.getAvailableTargets(focused, windows);

        assert(Array.isArray(result));
        assert(result.length == 1); 
        assert(result[0].id == "tabToAnotherWindow");
    });

    it ('excludes incognito targets -- has no targets', async function() {
        await Options.set(OptionsEnum.incognito, "no");

        let windows = Mocks.getWindows([
            { focused: false, incognito: true, tabOptions: { tabCount: 7 } },
            { focused: true, incognito: false, tabOptions: { tabCount: 1 } },
        ]);
        let focused = windows.find(x => x.focused);

        let result = await Teleport.getAvailableTargets(focused, windows);

        assert(Array.isArray(result));
        assert(result.length == 0);
    });

    it ('excludes incognito targets -- has targets: [tabToAnotherWindow]', async function() {
        await Options.set(OptionsEnum.incognito, "no");

        let windows = Mocks.getWindows([
            { focused: false, incognito: false, tabOptions: { tabCount: 3 } },
            { focused: false, incognito: true, tabOptions: { tabCount: 4 } },
            { focused: true, incognito: false, tabOptions: { tabCount: 1 } },
        ]);
        let focused = windows.find(x => x.focused);

        let result = await Teleport.getAvailableTargets(focused, windows);

        assert(Array.isArray(result));
        assert(result.length == 1); 
        assert(result[0].id == "tabToAnotherWindow");
    });

    this.afterEach(() => {
        Mocks.restoreStorage();
    });

    this.afterAll(() => {
        chrome.flush();
    });
});