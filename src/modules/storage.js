/**
 * An interface for Chrome storage that allows to 
 * read and restore data between sessions.
 * 
 * WARNING: chrome.storage API doesn't seem to support promises (calls return 'undefined'),
 * although the documentation claims it works. Therefore, this module exposes an interface with async functions,
 * but internally still relies on callback-based version of the Chrome API.
 * 
 * Details: https://stackoverflow.com/questions/42191030/promise-support-for-chrome-extensions-api 
 */
var Storage = {
    /**
     * Saves the data in the storage.
     * @param {string} key - setting key
     * @param {*} value - value to save
     */
    save: async function(key, value) {
        return new Promise(resolve => {
            chrome.storage.local.set({ [key]: value }, function() { 
                resolve();
            });
        });
    },
    /**
     * Reads the data from the storage.
     * @param {string} key - setting key
     */
    restore: async function(key) {
        return new Promise(resolve => {
            chrome.storage.local.get([key], function(result) {
                resolve(result[key]);
            });
        });
    }
};
module.exports = Storage;