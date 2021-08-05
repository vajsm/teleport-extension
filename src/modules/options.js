const HtmlHelper = require('./html-helper.js');
const Storage = require('./storage.js');

/**
 * Represents a single setting available for selection from a set of possible options.
 */
class OptionValue {
    constructor(value, isDefault = false) {
        this.value = value;
        this.isDefault = isDefault;
    }
    /**
     * Localized text representing this setting.
     */
    get label() {
        let key = `option_${this.value}`;
        return chrome.i18n.getMessage(key);
    }
}

/**
 * Represents a set of settings available for selection.
 */
class Option {
    constructor(id, values) {
        if (this.constructor === Option) {
            throw new Error("Option is an abstract class and cannot be instantiated.");
        }
        this.id = id;
        this.values = values;
        this.selectedValue = null;
        this.onChangedCallback = function (key, value) {};
    }
    /**
     * Localized text representing a set of settings (in other words, a header).
     */
    get label() {
        let key = `option_${this.id}`;
        return chrome.i18n.getMessage(key);
    }
    /**
     * Callback invoked when the select value in the set changes.
     */
    set onChanged(callback) {
        this.onChangedCallback = callback;
    }
    /**
     * Creates a HTML for a set of options and appends it to the parent.
     * @param {*} parent - DIV parent
     */
    generateHtml(parent) {
        let title = document.createElement("h2");
        let div = document.createElement("div");
        title.appendChild(document.createTextNode(`${this.label}:`));
        div.className = "form-group";
        div.appendChild(title);
        div.appendChild(this.getOptionNodes(this.values, this.selectedValue));
        parent.appendChild(div);
    }
    /**
     * Restores (selects) the set to the given value. If the value is null,
     * the set will be restored to a default value.
     * @param {OptionValue} item - item to be select
     */
    restore(item) {
        let option = this.values.find(x => x.value == item) 
                  ?? this.values.find(x => x.isDefault);
        this.selectOption(option);
    }
    /**
     * Returns HTML for the options. 
     * Needs to be restored in derived class, based on the type of the controls.
     * @param {OptionValue[]} values - possible options to select 
     * @param {OptionValue} initialValue - currently selected (initial) value
     */
    getOptionNodes(values, initialValue) {
        throw new Error("Method must be overloaded in a derived class.");
    }
    /**
     * Defines how to select the option in the UI.
     * Needs to be restored in derived class, based on the type of the controls.
     * @param {OptionValue} option 
     */
    selectOption(option) {
        throw new Error("Method must be overloaded in a derived class.");
    }
}

/**
 * Represents a set of settings available for selection from a dropdown list.
 */
class DropdownOption extends Option {
    getOptionNodes(values, initialValue) {
        let onChanged = function (event) {
            this.onChangedCallback(this.id, event.target.value);
        }.bind(this);
        let select = HtmlHelper.createSelect(this.id, values, onChanged);
        select.value = initialValue;
        return select;
    }
    selectOption(option) {
        document.getElementById(this.id).value = option.value;
    }
}

/**
 * Represents a set of settings available for selection from a set of radio buttons.
 */
class RadioOption extends Option {
    getOptionNodes(values, initialValue) {
        let onChanged = function (event) {
            this.onChangedCallback(this.id, event.target.id);
        }.bind(this);
        let div = document.createElement("div");
        div.class = "form-group-labels";
        values.forEach(x => {
            let label = HtmlHelper.createLabel(x);
            let radioButton = HtmlHelper.createRadioButton(this.id, x, onChanged);
            if (x.value == initialValue) {
                radioButton.checked = true;
            }
            div.appendChild(label);
            div.appendChild(radioButton);
        });
        return div;
    }
    selectOption(option) {
        let nodeList = document.getElementsByName(this.id);
        let elements = Array.prototype.slice.call(nodeList);
        elements.find(x => x.id == option.value).checked = true;
    }
}

/**
 * Reads the value of a given option from local storage and updates the HTML.
 * @param {*} option 
 * @returns the updated option
 */
async function restoreOption(option) {
    let savedValue = await Storage.restore(option.id);
    option.selectedValue = savedValue;
    return option;
}

/**
 * This enum represents available options to configure in the extension.
 */
const OptionsEnum = 
{
    /**
     * Represents the target position of teleported tab(s).
     * Available values: `beginning`, `end`.
     */
    position: "position",
    /**
     * Represents the display language.
     * Available values: two-letter ISO 639-1 language code.
     */
    language: "language",
    /**
     * Represents the availability of "teleport all tabs" option 
     * in the context menu.
     * Available values: `yes`/`no`.
     */
    allTabs: "alltabs",
    // Incognito tabs as a target are disabled until there's a way 
    // to move tabs to incognito window
    /**
     * Represents the availability of incognito windows as teleport target
     * in the context menu.
     * Available values: `yes`/`no`.
     */
    // incognito: "incognito"
}
Object.freeze(OptionsEnum);

/**
 * Definition of options supported by the extension
 * and their default values.
 */
const SupportedOptions = [
    new DropdownOption(OptionsEnum.position, [
        new OptionValue("beginning"),
        new OptionValue("end", true)
    ]),
    new DropdownOption(OptionsEnum.language, [
        new OptionValue("en", true),
        // TODO: other languages not yet supported
        // new OptionValue("pl"),
        // new OptionValue("de")
    ]),
    new RadioOption(OptionsEnum.allTabs, [
        new OptionValue("yes", true),
        new OptionValue("no")
    ]),
    // Incognito tabs as a target are disabled until there's a way 
    // to move tabs to incognito window
    // new RadioOption(OptionsEnum.incognito, [
    //     new OptionValue("yes"),
    //     new OptionValue("no", true) 
    // ])
];

/**
 * A set of helper methods to read, update and sync extension settings.
 */
var Options = {
    /**
     * Initializes the storage with default options.
     */
    setDefaults: async function() {
        SupportedOptions.forEach(option => {
            let defaultOption = option.values.find(x => x.isDefault);
            Storage.save(option.id, defaultOption.value);
        });
    },
    /**
     * Returns the current setting with a given key, or null, if it cannot be found.
     * @param {string} key 
     */
    get: async function(key) {
        let option = SupportedOptions.find(option => option.id == key);
        if (option == null) {
            console.warn("Not supported option", key);
            return null;
            // throw new Error("Not supported option:", key);
        }
        return restoreOption(option);
    },
    /**
     * Returns all the supported settings and their values.
     */
    getAll: async function() {
        let allOptions = await Promise.all(SupportedOptions.map(async (option) => {
            return restoreOption(option);
        }));
        return allOptions;
    },
    /**
     * Allows to set a value for an extension option.
     * @param {*} key - must be a supported extension key. You can use `OptionsEnum` values
     * @param {*} value - must lay in the range of supported values for this option
     */
    set: async function(key, value) {
        Storage.save(key, value);
    }
}

module.exports = {
    Options,
    OptionsEnum
}