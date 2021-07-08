var BrowserOptions = {
    saveOption: function (key, value) {
        chrome.storage.local.set({ [key]: value }, function() { });
    },

    readOption: function (key, callback) {
        chrome.storage.local.get([key], function (result) {
            callback(result[key]);
        });
    }
};

// todo: refactor HTML generation; extract to a helper module
// todo: document
// todo: rename members and arguments

class OptionValue {

    constructor (value, isDefault = false) {
        this.value = value;
        this.isDefault = isDefault;
    }

    get label() {
        let key = `option_${this.value}`;
        return chrome.i18n.getMessage(key);
    }
}

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

    get label() {
        let key = `option_${this.id}`;
        return chrome.i18n.getMessage(key);
    }

    generateHtml(parent) {
        let title = document.createElement("h2");
        let div = document.createElement("div");
        title.appendChild(document.createTextNode(`${this.label}:`));
        div.className = "form-group";
        div.appendChild(title);
        div.appendChild(this.getOptionNodes(this.values));
        parent.appendChild(div);
    }

    restore(item) {
        let option = this.values.find(x => x.value == item);
        if (option == null) {
            option = this.values.find(x => x.isDefault);
        }
        this.selectOption(option);
    }

    getOptionNodes(values) {
        throw new Error("Method must be overloaded in a subclass.");
    }

    selectOption(option) {
        throw new Error("Method must be overloaded in a subclass.");
    }

    set onChanged(callback) {
        this.onChangedCallback = callback;
    }
}

class DropdownOption extends Option {

    getOptionNodes(values) {
        let select = document.createElement("select");
        select.name = this.id;
        select.id = this.id;
        values.forEach(x => {
            let option = document.createElement("option");
            option.value = x.value;
            option.appendChild(document.createTextNode(x.label));
            select.appendChild(option);
        });
        select.addEventListener("change", function (event) {
            this.onChangedCallback(this.id, event.target.value);
        }.bind(this));
        return select;
    }

    selectOption(option) {
        console.log("Should select", option);
        document.getElementById(this.id).value = option.value;
    }
}

class RadioOption extends Option {

    getOptionNodes(values) {
        let div = document.createElement("div");
        div.class = "form-group-labels";
        values.forEach(x => {
            let label = document.createElement("label");
            label.for = x.value;
            label.class = "radio-label";
            label.appendChild(document.createTextNode(x.label));
            div.appendChild(label);

            let input = document.createElement("input");
            input.type = "radio";
            input.name = this.id;
            input.id = x.value;
            input.addEventListener("change", function (event) {
                this.onChangedCallback(this.id, event.target.id);
            }.bind(this));
            div.appendChild(input);
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

module.exports.BrowserOptions = BrowserOptions;
module.exports.DropdownOption = DropdownOption;
module.exports.RadioOption = RadioOption;
module.exports.OptionValue = OptionValue;