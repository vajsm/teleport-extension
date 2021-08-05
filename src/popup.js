require("core-js/stable");
require("regenerator-runtime/runtime");

const ContextMenu = require('./modules/context-menu.js');
const ExtensionOptions = require('./modules/options.js').Options;
const HtmlHelper = require('./modules/html-helper.js');
const Localization = require('./modules/localization.js');
const Package = require("../package.json");

/**
 * Appends the translated text to the given element.
 * 
 * @param {HTMLElement} parent - a parent HTML element for the form.
 * @param {string} type - HTML text element class
 * @param {string} elementId - HTML element ID
 * @param {string} textToAppend - if not 
 */
// eslint-disable-next-line max-params
async function createLocalizedText(parent, id, type, textToAppend) {
    let localizedText = await Localization.getMessage(`popup_${id}`);
    if (textToAppend != null) {
        localizedText += `: ${textToAppend}`;
    }
    let element = HtmlHelper.createText(id, type, localizedText);
    parent.appendChild(element);
}

/**
 * Creates HTML for extension options.
 * 
 * @param {HTMLElement} parent - a parent HTML element for the form.
 */
function createOptionsForm(parent) {
    ExtensionOptions.getAll().then(options => options.forEach(option => {
        option.generateHtml(parent);
        option.onChanged = function (key, value) {
            ExtensionOptions.set(key, value).then(() => {
                console.log(`Option changed: ${key} - ${value}`);
                ContextMenu.forceRefresh();
            });
        };
    }));
}

let detailsRoot = document.getElementById('details');
createLocalizedText(detailsRoot, 'title', 'h1');
createLocalizedText(detailsRoot, 'description', 'p');
createLocalizedText(detailsRoot, 'version', 'p', Package.version);
createLocalizedText(detailsRoot, 'source', 'p', Package.homepage);

let formRoot = document.getElementById('form-root');
createOptionsForm(formRoot);