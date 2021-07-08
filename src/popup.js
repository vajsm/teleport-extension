const Storage = require('./modules/storage.js');
const ExtensionOptions = require('./modules/options.js').ExtensionOptions;

let formRoot = document.getElementById("form-root");

ExtensionOptions.forEach(option => {
    option.generateHtml(formRoot);
    option.onChanged = (function (key, value) {
        Storage.save(key, value);
    });
    Storage.restore(option.id, function (value) {
        option.restore(value);
    });
});