const OptionsModule = require('./modules/options.js');
const BrowserOptions = OptionsModule.BrowserOptions;
const DropdownOption = OptionsModule.DropdownOption;
const RadioOption = OptionsModule.RadioOption;
const OptionValue = OptionsModule.OptionValue;

const options = [
    new DropdownOption("position", [
        new OptionValue("beginning"),
        new OptionValue("end", isDefault = true)
    ]),
    new DropdownOption("language", [
        new OptionValue("en", isDefault = true),
        new OptionValue("pl"),
        new OptionValue("de")
    ]),
    new RadioOption("alltabs", [
        new OptionValue("yes", isDefault = true),
        new OptionValue("no")
    ]),
    new RadioOption("incognito", [
        new OptionValue("yes", isDefault = true),
        new OptionValue("no")
    ])
];

let formRoot = document.getElementById("form-root");
options.forEach(option => {
    option.generateHtml(formRoot);
    option.onChanged = (function (key, value) {
        BrowserOptions.saveOption(key, value);
    });
    BrowserOptions.readOption(option.id, function (value) {
        option.restore(value);
    });
});