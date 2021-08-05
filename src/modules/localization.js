async function getFromLocalFile(key) {
    return new Promise(resolve => {
        let languageKey = 'en'; 
        let file = require(`../../_locales/${languageKey}/messages.json`);
        let message = key in file ? file[key] : '';
        resolve(message);
    });
}

/**
 * Module providing localized texts in the extension.
 * 
 * WARNING: only "en" is supported at the moment, because of the fact of using manifest v3.
 * https://stackoverflow.com/questions/68579846/loading-localized-texts-getting-browser-language-in-background-service-worker 
 */
var Localization = {
    getMessage: async function(key) {
        try {
            return chrome.i18n.getMessage(key);
        }
        catch {
            let entry = await getFromLocalFile(key);
            return entry.message;
        }
    }
};
module.exports = Localization;