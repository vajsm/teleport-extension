var Options = {
    setOption: function (key, value) {
        chrome.storage.local.set({ [key]: value }, function() {
            console.log("Successfully set in storage", key, value);
        });
    },

    getOption: function (key, callback) {
        chrome.storage.local.get([key], function (result) {
            console.log("retrieved from storage", key, result[key]);
            callback(result[key]);
        });
    }
}
module.exports = Options;