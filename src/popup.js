import "core-js/stable";
import "regenerator-runtime/runtime";

const ExtensionOptions = require('./modules/options.js').Options;

// todo: load title etc. from manifest
// and localize texts

let formRoot = document.getElementById("form-root");

ExtensionOptions.getAll().then(options => options.forEach(option => {
    option.generateHtml(formRoot);
    option.onChanged = (function (key, value) {
        ExtensionOptions.set(key, value).then(() => {
            console.log(`Option changed: ${key} - ${value}`);
        });
    });
}));