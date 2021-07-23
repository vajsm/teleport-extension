import "core-js/stable";
import "regenerator-runtime/runtime";
import assert from 'assert';
import chrome from 'sinon-chrome/extensions';

describe ('Windows module: getName', function() {

    let Windows, Mocks;

    this.beforeAll(() => {
        global.chrome = chrome;

        Windows = require("../src/modules/windows.js");
        Mocks = require("./mocks.js");
    });

    it ('has no highlighed tab', function() {
        let window = Mocks.getWindow({ 
            focused: false, 
            incognito: false, 
            tabOptions: { tabCount: 3, highlighted: false } 
        });

        let result = Windows.getName(window, 7);

        assert(result == "Window 7");
    });

    it ('has a highlighed tab', function() {
        let window = Mocks.getWindow({ 
            focused: true, 
            incognito: false, 
            tabOptions: { tabCount: 7, highlighted: true } 
        });

        let result = Windows.getName(window, 2);

        assert(result == "Window 2 -- Tab 1");
    });

    it ('is incognito', function() {
        let window = Mocks.getWindow({ 
            focused: true, 
            incognito: true, 
            tabOptions: { tabCount: 1, highlighted: true } 
        });

        let result = Windows.getName(window, 1);

        assert(result == "Window 1 (incognito) -- Tab 1");
    });
    
    this.afterAll(() => {
        chrome.flush();
    });
});

describe ('Windows module: isRefreshRequired', function() {

    let Mocks, Windows;

    this.beforeAll(() => {
        global.chrome = chrome;

        Windows = require("../src/modules/windows.js");
        Mocks = require("./mocks.js");
    });

    this.beforeEach(() => {
        Mocks.setupStorage();
    });

    it ('has changed focus to the same window', async function() {

        let windows = Mocks.getWindows([
            { focused: true, incognito: false, tabOptions: { tabCount: 1 } },
            { focused: false, incognito: false, tabOptions: { tabCount: 1 } }
        ]);
        await Windows.saveFocusedWindow(windows[0]);

        var result = await Windows.isRefreshRequired(windows[0]);

        assert(result == false);
    });

    it ('has changed focus to another window', async function() {
        let windows = Mocks.getWindows([
            { focused: true, incognito: false, tabOptions: { tabCount: 1 } },
            { focused: false, incognito: false, tabOptions: { tabCount: 1 } }
        ]);
        await Windows.saveFocusedWindow(windows[0]);

        var result = await Windows.isRefreshRequired(windows[1]);

        assert(result == true);
    });

    it ('has tab count changed to one', async function() {
        let window = Mocks.getWindow({ focused: true, incognito: false, tabOptions: { tabCount: 2 } });
        await Windows.saveFocusedWindow(window);
        window.tabs.pop();

        var result = await Windows.isRefreshRequired(window);

        assert(result == true);
    });

    it ('has tab count changed to two', async function() {
        let window = Mocks.getWindow({ focused: true, incognito: false, tabOptions: { tabCount: 2 } });
        let otherTab = window.tabs.pop();
        assert (window.tabs.length == 1);
        await Windows.saveFocusedWindow(window);
        window.tabs.push(otherTab);
        assert (window.tabs.length == 2);

        var result = await Windows.isRefreshRequired(window);

        assert(result == true);
    });

    it ('has tab count changed to three', async function() {
        let window = Mocks.getWindow({ focused: true, incognito: false, tabOptions: { tabCount: 3 } });
        let otherTab = window.tabs.pop();
        assert (window.tabs.length == 2);
        await Windows.saveFocusedWindow(window);
        window.tabs.push(otherTab);
        assert (window.tabs.length == 3);

        var result = await Windows.isRefreshRequired(window);

        assert(result == false);
    });

    this.afterEach(() => {
        Mocks.restoreStorage();
    });

    this.afterAll(() => {
        chrome.flush();
    });
});