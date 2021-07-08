/**
 * An interface for Chrome storage that allows to 
 * read and restore data between sessions.
 */
 var Storage = {
     /**
      * Saves the data in the storage.
      * @param {string} key - setting key
      * @param {*} value - value to save
      */
    save: function (key, value) {
        chrome.storage.local.set({ [key]: value }, function() { });
    },

    /**
     * Reads the data from the storage.
     * @param {string} key - setting key
     * @param {*} callback - callback invoked when the data is retrieved from storage
     */
    restore: function (key, callback) {
        chrome.storage.local.get([key], function (result) {
            callback(result[key]);
        });
    }
};
module.exports = Storage;