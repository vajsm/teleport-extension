async function getFromLocalFile(key) {
    return new Promise((resolve, reject) => {
        chrome.i18n.getAcceptLanguages((langs) => {
            let languageKey = 'en'; // todo: select appropriate language
            let file = require(`../../_locales/${languageKey}/messages.json`);
            let message = file.hasOwnProperty(key) ? file[key] : '';
            resolve(message);
        });
    })
}

var Localization = {
    getMessage: async function(key) {
        try {
            return chrome.i18n.getMessage(key);
        }
        catch {
            let entry = await getFromLocalFile(key);
            return entry.message;
        }
    },

    setLanguage: function(languageKey) {
        // todo: implement language selection
    }
};
module.exports = Localization;