var HtmlHelper = {

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

    createLabel: function(option) {
        let label = document.createElement("label");
        label.for = option.value;
        label.class = "radio-label";
        label.appendChild(document.createTextNode(option.label));
        return label;
    },

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