/**
 * Module that helps to create HTML for extension popup.
 */
var HtmlHelper = {
    /**
     * Creates a dropdown element with options to select from.
     * @param {string} id - identifier and name of the "select" element
     * @param {OptionValue[]} options - a set of OptionValue elements that translate to selectable options
     * @param {*} onChanged - callback invoked when a value has been changed
     * @returns "select" element
     */
    createSelect: function(id, options, onChanged) {
        let select = document.createElement("select");
        select.name = id;
        select.id = id;
        options.forEach(x => {
            let option = document.createElement("option");
            option.value = x.value;
            option.appendChild(document.createTextNode(x.label));
            select.appendChild(option);
        });
        select.addEventListener("change", onChanged);
        return select;
    },
    /**
     * Creates a label for an element (e.g. a radio button).
     * @param {OptionValue} option -  OptionValue element that translates to a selectable option
     * @returns "label" element
     */
    createLabel: function(option) {
        let label = document.createElement("label");
        label.for = option.value;
        label.class = "radio-label";
        label.appendChild(document.createTextNode(option.label));
        return label;
    },
    /**
     * Creates a radio button for an option.
     * @param {string} name - name of the radio button
     * @param {OptionValue} option - OptionValue element that translates to a selectable option
     * @param {*} onChanged -  callback invoked when a value has been changed
     * @returns "input" element
     */
    createRadioButton: function(name, option, onChanged) {
        let input = document.createElement("input");
        input.type = "radio";
        input.name = name;
        input.id = option.value;
        input.addEventListener("change", onChanged);
        return input;
    }
};
module.exports = HtmlHelper;