const HtmlHelper = require('./html-helper.js');

/**
 * Represents a single setting available for selection from a set of possible options.
 */
class OptionValue {
    constructor (value, isDefault = false) {
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
    constructor (id, values) {
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
        div.appendChild(this.getOptionNodes(this.values));
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
     */
    getOptionNodes(values) {
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
    getOptionNodes(values) {
        let onChanged = function (event) {
            this.onChangedCallback(this.id, event.target.value);
        }.bind(this);
        let select = HtmlHelper.createSelect(this.id, values, onChanged);
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
    getOptionNodes(values) {
        let onChanged = function (event) {
            this.onChangedCallback(this.id, event.target.id);
        }.bind(this);
        let div = document.createElement("div");
        div.class = "form-group-labels";
        values.forEach(x => {
            let label = HtmlHelper.createLabel(x);
            let radioButton = HtmlHelper.createRadioButton(this.id, x, onChanged);
            div.appendChild(label);
            div.appendChild(radioButton);
        });
        return div;
    }
    selectOption(option) {
        let nodeList = document.getElementsByName(this.id);
        let elements = Array.prototype.slice.call(nodeList);
        let optionToCheck = elements.find(x => x.id == option.value);
        optionToCheck.checked = true;
    }
}

/**
 * Definition of options supported by the extension
 * and their default values.
 */
const ExtensionOptions = [
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
module.exports = ExtensionOptions;